const Service = require('./base')
const xlsx = require('node-xlsx')
const fs = require('fs')
const { role } = require('../extend/constains')
const { ADMIN, ZONGDAI, TEDAI } = role

class OrderService extends Service {

  // 添加订单
  async add (params) {
    const { user, goods } = params
    const orderId = await this.createOrderId()
    let total = 0 // 总价格
    let ztotal = 0
    let ttotal = 0
    let ltotal = 0
    let btotal = 0
    let totalNum = 0 // 总商品数
    try {
      const curRole = this.user.role
      const curUserId = this.user._id || this.user.id
      const ownerBoss = curRole === TEDAI ? this.user.boss : curUserId // 特代就存他的上级，总代就存他自己
      const status = curRole === ZONGDAI ? 1 : 0
      const orderType = curRole === ZONGDAI ? 1 : 2 // 1总代提交 2特代提交
      const goodsInfo = await Promise.all(goods.map(async item => {
        let curItem = { num: item.num, userId: curUserId }
        const priceType = curRole === ZONGDAI ? 'zprice' : 'tprice' // 角色价格类型
        // 查商品表，获取商品信息
        const curGoodsModel = await this.ctx.model.Goods.findById(item.id, 'skuId bprice lprice zprice tprice apply name image desc ' + priceType)
        const curGoodsInfo = curGoodsModel.toObject()
        curGoodsInfo.price = curGoodsInfo[priceType]
        curGoodsInfo.total = curGoodsInfo.price * item.num
        curGoodsInfo.btotal = curGoodsInfo.bprice * item.num // 成本
        curGoodsInfo.ztotal = curGoodsInfo.zprice * item.num // 成本
        curGoodsInfo.ttotal = curGoodsInfo.tprice * item.num // 成本
        curGoodsInfo.ltotal = curGoodsInfo.lprice * item.num // 成本
        curItem = Object.assign(curItem, curGoodsInfo)
        delete curItem._id
        total += curGoodsInfo.total
        btotal += curGoodsInfo.btotal
        ztotal += curGoodsInfo.ztotal
        ttotal += curGoodsInfo.ttotal
        ltotal += curGoodsInfo.ltotal
        totalNum += item.num
        return curItem
      }))
      // 存订单商品表
      const orderGoodsInfo = await this.ctx.model.OrderGoods.create(goodsInfo)
      const goodsIds = orderGoodsInfo.map(item => {
        return item._id
      })
      // 存订单表
      const orderInfo = await this.ctx.model.Order.create({
        owner: curUserId,
        ownerBoss,
        orderId,
        goods: goodsIds,
        user,
        total,
        btotal,
        ztotal,
        ttotal,
        ltotal,
        totalNum,
        status,
        orderType
      })
      if (orderInfo) return { orderId }
      this.ctx.throw(200, '录单失败')
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '录单失败，请稍后再试！')
    }
  }

  // 查询列表
  async list (params) {
    let { pageSize = 100, page = 1, status, startTime, endTime, userId, sort = '-1', key, type } = params
    // 查询条件
    const queryCondition = {}
    const curUserId = this.user._id || this.user.id
    // type 为总代查询特代的
    if (type && Number(type) === 1) {
      queryCondition.ownerBoss = curUserId
    } else {
      if (this.user.role !== 1) {
        queryCondition.owner = curUserId
      }
    }
    if (status) queryCondition.status = status
    if (startTime || endTime) {
      queryCondition.createdAt = {}
      if (startTime) {
        queryCondition.createdAt.$gte = new Date(startTime)
      }
      if (endTime) {
        queryCondition.createdAt.$lte = new Date(endTime)
      }
    }
    // 搜索关键字
    if (key) {
      if (this.ctx.helper.reg.telephone.test(key)) {
        queryCondition['user.mobile'] = key
      } else {
        queryCondition['user.name'] = key
      }
    }
    // 传userId，则查询对应下属的订单列表
    if (userId) queryCondition.owner = userId
    // console.log(queryCondition)
    try {
      const orders = await this.ctx.model.Order.find(
        {...queryCondition},
        '_id orderId user status createdAt owner ownerBoss orderType ')
        .sort({createdAt: sort})
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
        .populate({path: 'owner', select: 'username'})
        .populate({path: 'ownerBoss', select: 'username'})
      const count = await this.ctx.model.Order.count({...queryCondition})
      if (!orders) this.ctx.throw(200, '获取订单失败')
      return { orders, count }
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '获取订单列表失败')
    }
  }

  // 导出excel
  async download (params) {
    // 公司才有权限导出订单
    // if (this.user.role > 1) this.ctx.throw(200, '无权操作')
    const { status, startTime, endTime } = params
    const condition = {}
    if (status) condition.status = status
    if (startTime || endTime) {
      condition.createdAt = {}
      if (startTime) condition.createdAt.$gte = new Date(startTime)
      if (endTime) condition.createdAt.$lte = new Date(endTime)
    }
    const orderData = await this.ctx.model.Order.find(
      {...condition},
      'orderId user status createdAt gooods total btotal ztotal'
    ).populate({ path: 'goods', select: 'name price bprice num zprice apply' }).populate('owner')
    const xlsxData = [['订单号', '下单时间', '所属总代', '客户姓名', '客户电话', '收货地址', '商品名称', '数量', '总代价', '进价', '利润', '供应商']]
    await Promise.all(orderData.map(async item => {
      const { orderId, user, createdAt, goods, total } = item
      const { name: username, address, mobile } = user
      // 获取订单所属者名称，如果不是总代，则获取他的上级
      let zName = item.owner.username
      if (item.owner.role === 3) {
        const bossInfo = await this.ctx.model.User.findById(item.owner.boss)
        zName = bossInfo.username
      }
      goods.map(item => {
        const lineData = [orderId, createdAt, zName, username, mobile, address, item.name, item.num, item.zprice, item.bprice, (item.zprice - item.bprice) * item.num, item.apply]
        xlsxData.push(lineData)
      })
    }))
    const buffer = await xlsx.build([{ name: 'sheet1', data: xlsxData }])
    return buffer
  }

  // 订单详情
  async detail (id) {
    if (!id || isNaN(parseInt(id))) this.ctx.throw(200, '非法ID')
    try {
      const detailInfo = await this.ctx.model.Order.find(
        { _id: id },
        '_id orderId goods createAt status user total ztotal ttotal ltotal totalNum owner ownerBoss orderType'
      ).populate({ path: 'goods', select: '_id image num total ttotal ztotal ltotal category zprice tprice lprice price name desc' })
      .populate({path: 'owner', select: 'username'})
      .populate({path: 'ownerBoss', select: 'username'})
      if (!detailInfo) this.ctx.throw(200, '非法ID')
      return detailInfo[0]
    } catch (e) {
      this.ctx.throw(200, '获取订单详情失败')
    }
  }

  // 更新
  async update (params) {
    const { user, goods, orderId } = params
    try {
      const goodsInfo = await Promise.all(goods.map(async item => {
        let curItem = { num: item.num, userId: this.ctx.session.user.id }
        const priceType = 'tprice' // 角色价格类型，后续要处理
        // 查商品表，获取商品信息
        const curGoodsModel = await this.ctx.model.Goods.findById(item.id, 'skuId name image desc ' + priceType)
        const curGoodsInfo = curGoodsModel.toObject()
        curGoodsInfo.price = curGoodsInfo[priceType]
        curGoodsInfo.total = curGoodsInfo.price * item.num
        curItem = Object.assign(curItem, curGoodsInfo)
        // 必须删掉，不然后面会覆盖mongodb的_id
        delete curItem._id
        return curItem
      }))
      // 存订单商品表
      const orderGoodsInfo = await this.ctx.model.OrderGoods.create(goodsInfo)
      const goodsIds = orderGoodsInfo.map(item => {
        return item._id

      })
      // 更新订单表
      const orderInfo = await this.ctx.model.Order.findOneAndUpdate(
        { orderId },
        { goods: goodsIds, user },
        { new: true }
      )
      if (orderInfo) {
        return {
          orderId,
          goods: goodsInfo,
          user
        }
      }
      this.ctx.throw(200, '更新失败，请稍后再试！')
    } catch (e) {
      this.ctx.throw(200, '更新失败，请稍后再试！')
    }
  }

  // 订单审核 orderType 0 通过 1:驳回 3:发货  -1:取消
  async check (id, orderType, driver) {
    if (!id) this.ctx.throw(200, '无效订单')
    const curRole = this.user.role
    // if (curRole > 2 && orderType !== 6) this.ctx.throw(200, '您无权审核')
    let newStatus = 1 // 默认一级审核
    if (curRole === ADMIN) newStatus = 2 // 二级审核
    if (curRole === ADMIN && driver === 1) newStatus = 3 // 发货
    // 驳回情况
    if (orderType === 1) {
      if (curRole === ADMIN) {
        newStatus = 5 // 公司驳回
      } else {
        newStatus = 4 // 总代驳回
      }
    }
    // 发货
    if (orderType === 3 && curRole === ADMIN) {
      newStatus = 3
    }
    // 取消订单
    if (orderType === 6) {
      newStatus = 6
    }
    try {
      await this.ctx.model.Order.findOneAndUpdate(
        { _id: id },
        { status: newStatus },
        { new: true }
      )
      return true
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '审核异常，请稍后再试')
    }
  }

  // 快递单号录入
  async driver (params) {
    try {
      const curRole = this.user.role
      if (curRole !==1) this.ctx.throw(200, '无权访问')
      const { driverNo, id } = params
      const updateInfo = await this.ctx.model.OrderGoods.findOneAndUpdate(
        { _id: id },
        { driverNo },
        { new: true }
      )
      if (!updateInfo) this.ctx.throw(200, '录入失败')
      return updateInfo
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '操作失败')
    }
  }

  // 生成orderId
  async createOrderId () {
    let orderBool = true
    let gNum = 0
    const bit = 10
    let gId
    while (orderBool && gNum < Math.pow(10, bit + 1)) {
      gId = ''
      for (let index = 0; index < bit; index++) {
        gId += Math.floor(Math.random() * 10)
      }
      orderBool = await this.ctx.model.Order.findOne({ orderId: gId })
      gNum++
    }
    if (gId) {
      return gId
    }
    throw this.ctx.throw('订单数量已达上限')
  }
}

module.exports = OrderService

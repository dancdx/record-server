const Service = require('./base')

class OrderService extends Service {

  // 添加订单
  async add (params, userId) {
    const { user, goods } = params
    const orderId = await this.createOrderId()
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
        delete curItem._id
        return curItem
      }))
      // 存订单商品表
      const orderGoodsInfo = await this.ctx.model.OrderGoods.create(goodsInfo)
      const goodsIds = orderGoodsInfo.map(item => {
        return item._id
      })
      // 存订单表
      const orderInfo = await this.ctx.model.Order.create({
        owner: userId,
        orderId,
        goods: goodsIds,
        user
      })
      if (orderInfo) return { orderId }
      this.ctx.throw(200, '录单失败，请稍后再试！')
    } catch (e) {
      this.ctx.throw(200, '录单失败，请稍后再试！')
    }
  }

  // 查询列表
  async list (params) {
    const { pageSize, page, status, userId } = params
    const condition = { skip: (page - 1) * pageSize, limit: parseInt(pageSize) }
    if (status) condition.status = status
    // 默认查询当前用户的订单列表
    let owner = this.user.id
    // 传userId，则查询对应下属的订单列表
    if (userId) owner = userId
    try {
      const orders = await this.ctx.model.Order.find(
        { owner },
        '_id orderId user status createAt ',
        condition)
      if (!orders) this.ctx.throw(200, '获取订单失败')
      return orders
    } catch (e) {
      this.ctx.throw(200, '获取订单列表失败')
    }
  }

  // 订单详情
  async detail (orderId) {
    if (!orderId || isNaN(parseInt(orderId))) this.ctx.throw(200, 'orderId is necessary, please try again')
    try {
      const detailInfo = await this.ctx.model.Order.find(
        { orderId: parseInt(orderId) },
        '_id orderId goods createAt status user'
      ).populate({ path: 'goods', select: '_id image num total category price name desc' })
      console.log(detailInfo)
      if (!detailInfo) this.ctx.throw(200, '订单号不存在')
      return detailInfo
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

  async check (orderId, driver) {
    if (!orderId) this.ctx.throw(200, '无效订单')
    const curRole = this.user.role
    if (curRole > 2) this.ctx.throw(200, '您无权审核')
    let newStatus = 1 // 默认一级审核
    if (curRole === 1) newStatus = 2 // 二级审核
    if (curRole === 1 && driver) newStatus = 3 // 发货
    try {
      await this.ctx.model.Order.findOneAndUpdate(
        { orderId },
        { status: newStatus },
        { new: true }
      )
      return true
    } catch (e) {
      this.ctx.throw(200, '审核异常，请稍后再试')
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

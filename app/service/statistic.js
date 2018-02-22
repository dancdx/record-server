const Service = require('./base')

class StatisticService extends Service {

  async index (params = {}) {
    try {
      const { id, role } = this.user
      // 查询条件
      const queryCondition = {}
      const { startTime, endTime, userId } = params
      if (startTime || endTime) {
        queryCondition.createdAt = {}
        if (startTime) {
          queryCondition.createdAt.$gte = new Date(startTime)
        }
        if (endTime) {
          queryCondition.createdAt.$lte = new Date(endTime)
        }
      }
      if (role === 3 || role === 2) {
        queryCondition.owner = this.user.id
      }
      // 传userId则查询对应用户的
      if (userId) queryCondition.owner = userId
      const orderList = await this.ctx.model.Order.find({...queryCondition}).populate('goods')
      const data = await this.filterList(orderList)
      // 总代则返回其下级代理
      if (role === 2) {
        const curUserInfo = await this.ctx.model.User.findOne({_id: id}, 'members').populate({ path: 'members', select: '_id username' })
        await Promise.all(curUserInfo.members.map(async item => {
          const newCondition = queryCondition
          newCondition.owner = item._id
          console.log(newCondition)
          const curCount = await this.ctx.model.Order.count({...newCondition})
          console.log(curCount)
          item.count = curCount
        }))
        data.members = curUserInfo.members
      }
      return data
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '查询失败')
    }
  }

  filterList (list) {
    let total = 0 // 订单总金额
    const orderCount = list.length // 订单数量
    let goodsCount = 0 // 商品总数量
    const goods = {}
    list.map(item => {
      total += item.total
      item.goods.map(gitem => {
        goodsCount += gitem.num
        if (!goods[gitem.skuId]) {
          goods[gitem.skuId] = { name: gitem.name, num: 0, total: 0 }
        }
        goods[gitem.skuId].num += gitem.num
        goods[gitem.skuId].total += gitem.total
      })
    })
    let goodsArr = []
    for (let key in goods) {
      goodsArr.push(goods[key])
    }
    return { total, orderCount, goodsCount, goodsArr }
  }
}

module.exports = StatisticService

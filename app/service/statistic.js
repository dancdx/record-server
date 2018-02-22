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
          goods[gitem.skuId] = { name: gitem.name, num: 0 }
        }
        goods[gitem.skuId].num += gitem.num
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

const Service = require('./base')

class GoodsService extends Service {

  // 上架，可同时增加多个
  async add (params) {
    const { goods } = params
    if (!goods) this.ctx.throw(200, '参数非法')
    try {
      await Promise.all(goods.map(async item => {
        item.skuId = await this.createSkuId()
        return item
      }))
      // const { name, desc, price, tprice, zprice } = params
      // 权限控制，待添加
      const info = await this.ctx.model.Goods.create(goods)
      if (!info) this.ctx.throw(200, '添加商品失败')
      return info.map(item => {
        return {
          id: item.id,
          image: item.image,
          skuId: item.skuId,
          name: item.name,
          desc: item.desc,
          bprice: item.bprice,
          tprice: item.tprice,
          zprice: item.zprice,
          lprice: item.lprice,
          apply: item.apply
        }
      })
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '上架失败，请稍后再试')
    }
  }

  // 查询所有
  async list (params) {
    const { page = 1, pageSize = 20, status } = params
    const queryCondition = {}
    if (status !== '') queryCondition.status = status
    try {
      // const condition = { skip: (page - 1) * pageSize, limit: pageSize }
      const goodsList = await this.ctx.model.Goods.find(
        {...queryCondition},
        '_id skuId name image desc price tprice zprice lprice',
        // condition
      )
      return goodsList.map(item => {
        return {
          id: item.id,
          image: item.image,
          skuId: item.skuId,
          name: item.name,
          desc: item.desc,
          bprice: item.bprice,
          tprice: item.tprice,
          zprice: item.zprice,
          lprice: item.lprice
        }
      })
    } catch (e) {
      this.ctx.throw(200, '获取商品列表失败')
    }
  }

  // 下架: 1,  上架:0
  async setGoodsStatus (id, type) {
    const status = Number(type) === 1 ? 1 : 0
    const goods = await this.ctx.model.Goods.findOneAndUpdate({ _id: id }, { status }, { new: true })
    if (!goods) this.ctx.throw(200, '操作失败')
    return true
  }

  // 修改
  async update (params) {
    const { goods } = params
    if (!goods) this.ctx.throw(200, '参数非法')
    const { id, name, desc, price, tprice, zprice, category = 0 } = goods
    const info = await this.ctx.model.Goods.findOneAndUpdate(
      { _id: id },
      { name, desc, price, tprice, zprice, category },
      { new: true }
    )
    if (!info) this.ctx.throw('更新商品信息失败')
    return {
      id: info._id,
      skuId: info.skuId,
      name: info.name,
      desc: info.desc,
      price: info.price,
      tprice: info.tprice,
      zprice: info.zprice
    }
  }

  // 删除
  async remove (id) {
    if (!id) this.ctx.throw('参数非法')
    await this.ctx.model.Goods.findByIdAndRemove(id)
    return true
  }

  // 生成skuId
  async createSkuId () {
    let goodsBool = true
    let gNum = 0
    const bit = 6
    let gId
    while (goodsBool && gNum < Math.pow(10, bit + 1)) {
      gId = ''
      for (let index = 0; index < bit; index++) {
        gId += Math.floor(Math.random() * 10)
      }
      goodsBool = await this.ctx.model.Goods.findOne({ skuId: gId })
      gNum++
    }
    if (gId) {
      return gId
    }
    throw this.ctx.throw('商品数量已达上限')
  }

}

module.exports = GoodsService

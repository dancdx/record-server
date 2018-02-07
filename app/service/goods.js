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
    const { page = 1, pageSize = 20, status = 0 } = params
    const queryCondition = {}
    try {
      // 默认查正常状态的，传3查询全部
      if (Number(status) !== 3) queryCondition.status = status
      // const condition = { skip: (page - 1) * pageSize, limit: pageSize }
      const goodsList = await this.ctx.model.Goods.find(
        {...queryCondition},
        '_id skuId name image desc bprice category tprice zprice lprice apply status',
        // condition
      ).populate('category')
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
          lprice: item.lprice,
          apply: item.apply,
          status: item.status,
          category: item.category.name,
          categoryId: item.category._id
        }
      })
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '获取商品列表失败')
    }
  }

  // 下架: 0,  上架:1
  async setGoodsStatus (id, type) {
    const status = Number(type) === 0 ? 1 : 0
    const goods = await this.ctx.model.Goods.findOneAndUpdate({ _id: id }, { status }, { new: true })
    if (!goods) this.ctx.throw(200, '操作失败')
    return true
  }

  // 修改
  async update (params) {
    const { goods } = params
    if (!goods) this.ctx.throw(200, '参数非法')
    try {
      const { id, name, desc, bprice, lprice, tprice, zprice, image, category } = goods[0]
      const info = await this.ctx.model.Goods.findOneAndUpdate(
        { _id: id },
        { name, desc, bprice, tprice, zprice, lprice, category, image },
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
    } catch (e) {
      console.log(e)
      this.ctx.throw('更新商品信息失败')
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

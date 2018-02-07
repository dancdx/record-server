'use strict'

const BaseController = require('./base')

class GoodsController extends BaseController {

  // 获取所有
  async index () {
    const params = this.ctx.query
    const goods = await this.service.goods.list(params)
    this.success(goods)
  }

  // 商品详情
  async detail () {
    const { goodsId } = this.ctx.params
    this.ctx.body = '暂时无法查询'
  }

  // 添加商品
  async add () {
    const params = this.ctx.request.body
    const info = await this.service.goods.add(params)
    this.success(info)
  }

  // 下架, 上架
  async setGoodsStatus () {
    const { id, type } = this.ctx.request.body
    await this.service.goods.setGoodsStatus(id, type)
    this.success('success')
  }

  // 更新
  async update () {
    const params = this.ctx.request.body
    const info = await this.service.goods.update(params)
    this.success(info)
  }

  // 删除
  async remove () {
    const { id } = this.ctx.query
    await this.service.goods.remove(id)
    this.success('success')
  }

}

module.exports = GoodsController

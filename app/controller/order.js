'use strict'

const BaseController = require('./base')

class OrderController extends BaseController {
  // 分页获取列表
  async index () {
    const params = this.ctx.query
    const orders = await this.service.order.list(params)
    this.success(orders)
  }

  // 添加订单
  async add () {
    const params = this.ctx.request.body
    const userId = this.user
    const info = await this.service.order.add(params, userId)
    this.success(info)
  }

  // 订单详情
  async detail () {
    const { id } = this.ctx.params
    const detailInfo = await this.service.order.detail(id)
    this.success(detailInfo)
  }

  // 更新
  async update () {
    const params = this.ctx.request.body
    const info = await this.service.order.update(params)
    this.success(info)
  }

  // 删除
  async remove () {
    const { id } = this.ctx.query
    await this.service.order.remove(id)
    this.success()
  }

  // 审核
  async check () {
    const { id, driver } = this.ctx.query
    await this.service.order.check(id, driver)
    this.success()
  }

  // 下载excel
  async download () {
    const params = this.ctx.request.body
    const info = await this.service.order.download(params)
    this.ctx.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename=order.xlsx'
    })
    this.ctx.body = info
  }

}

module.exports = OrderController

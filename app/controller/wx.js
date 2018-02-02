'use strict'

const BaseController = require('./base')

class WxController extends BaseController {

  async index() {
    const params = this.ctx.query
    const echostr = await this.service.wx.index(params)
    this.ctx.body = echostr
  }
}

module.exports = WxController

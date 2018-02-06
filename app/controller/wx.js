'use strict'

const BaseController = require('./base')

class WxController extends BaseController {

  async index () {
    const params = this.ctx.query
    const echostr = await this.service.wx.index(params)
    this.ctx.body = echostr
  }

  async token () {
    const token = await this.service.wx.token()
    this.ctx.body = token
  }
}

module.exports = WxController

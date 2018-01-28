'use strict'

const BaseController = require('./base')
const ms = require('ms')

class UserController extends BaseController {

  async index() {
    this.ctx.body = await this.ctx.model.User.find({})
  }

  async login() {
    const { username, password, remember = false } = this.ctx.request.body
    const userInfo = await this.service.user.login({ username, password, remember })
    this.ctx.session.user = userInfo
    // 记住密码30天
    if (remember === 'true' || remember === true) this.ctx.session.maxAge = ms('30d')
    this.success(userInfo)
  }

  async add() {
    const params = this.ctx.request.body
    const userInfo = await this.service.user.add(params)
    this.ctx.session.user = userInfo
    this.success(userInfo)
  }
}

module.exports = UserController

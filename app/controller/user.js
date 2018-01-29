'use strict'

const BaseController = require('./base')
const ms = require('ms')

class UserController extends BaseController {

  // 获取下级用户列表
  async index() {
    const userList = await this.service.user.list()
    this.success(userList)
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
    // this.ctx.session.user = userInfo
    this.success(userInfo)
  }
}

module.exports = UserController

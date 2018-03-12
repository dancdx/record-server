'use strict'

const BaseController = require('./base')
const ms = require('ms')

class UserController extends BaseController {
  // 获取下级用户列表
  async index () {
    const userList = await this.service.user.list()
    this.success(userList)
  }

  // 未审核列表 | 驳回列表
  async listCheck () {
    const { type } = this.ctx.query
    const userList = await this.service.user.listCheck(type)
    this.success(userList)
  }

  // 审核或驳回
  async check () {
    const { id, type } = this.ctx.query
    await this.service.user.check(id, type)
    this.success()
  }

  // 登陆
  async login() {
    const { username, password, remember = false } = this.ctx.request.body
    const userInfo = await this.service.user.login({ username, password, remember })
    this.ctx.session.user = userInfo
    this.ctx.session.maxAge = ms('10d')
    // 记住密码30天
    if (remember === 'true' || remember === true) this.ctx.session.maxAge = ms('30d')
    this.success(userInfo)
  }

  // 添加
  async add() {
    const params = this.ctx.request.body
    const userInfo = await this.service.user.add(params)
    // this.ctx.session.user = userInfo
    this.success('success')
  }

  // 获取用户信息
  async userinfo () {
    const { code } = this.ctx.query
    const userInfo = await this.service.user.userinfo(code)
    this.success(userInfo)
  }

  // 授权
  async auth () {
    const { code } = this.ctx.query
    const userInfo = await this.service.user.auth(code)
    this.ctx.session.user_auth = userInfo
    this.success('success')
  }
}

module.exports = UserController

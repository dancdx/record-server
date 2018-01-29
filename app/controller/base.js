'use strict'

const Controller = require('egg').Controller

class BaseController extends Controller {
  constructor(app) {
    super(app)
    this.app = app
  }

  get user () {
    return this.ctx.session.user && this.ctx.session.user.id
  }

  success(data = 'success') {
    this.ctx.body = {
      code: 0,
      data,
    }
  }

  fail(data) {
    this.ctx.body = {
      code: -1,
      data,
    }
  }

  unlogin() {
    this.ctx.body = {
      code: -2,
      data: null,
      message: '用户未登陆',
    }
  }

  notFound (msg) {
    msg = msg || 'not found'
    this.ctx.throw(404, msg)
  }
}

module.exports = BaseController

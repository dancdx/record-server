'use strict'

const BaseController = require('./base')

class TestController extends BaseController {

  async index() {
    this.ctx.body = await this.ctx.model.User.find({})
  }
}

module.exports = TestController

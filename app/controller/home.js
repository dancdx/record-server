'use strict'

const Controller = require('egg').Controller

class HomeController extends Controller {
  index() {
    this.ctx.body = 'hi, egg'
  }
}

module.exports = HomeController

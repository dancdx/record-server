'use strict'

const Controller = require('egg').Controller

class HomeController extends Controller {
  index() {
    this.ctx.body = 'hi, friends'
  }
}

module.exports = HomeController

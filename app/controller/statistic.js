'use strict'

const BaseController = require('./base')

class StatisticController extends BaseController {
  async index() {
    const params = this.ctx.qurey
    const data = await this.service.statistic.index(params)
    this.success(data)
  }
}

module.exports = StatisticController

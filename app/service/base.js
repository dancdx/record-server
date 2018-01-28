const Service = require('egg').Service

class BaseService extends Service {
  constructor(app) {
    super(app)
    this.app = app
  }
}

module.exports = BaseService

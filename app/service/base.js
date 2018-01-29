const Service = require('egg').Service

class BaseService extends Service {
  constructor(app) {
    super(app)
    this.app = app
  }

  get user () {
    return this.ctx.session.user
  }
}

module.exports = BaseService

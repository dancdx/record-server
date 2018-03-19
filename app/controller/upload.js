'use strict'

const BaseController = require('./base')

class UploadController extends BaseController {
  async index() {
    const uploadInfo = await this.service.upload.index()
    if (uploadInfo.length === 1) {
      this.success(uploadInfo[0])
    } else {
      this.success(uploadInfo)
    }
  }
}

module.exports = UploadController

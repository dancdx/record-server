const Service = require('./base')

class UploadService extends Service {

  async index (fileArr) {
    try {
      const uploadInfo = await this.ctx.model.Attchment.create(fileArr)
      if (!uploadInfo) this.ctx.throw(200, '上传文件失败')
      return uploadInfo.map(item => {
        return {
          url: item.url
        }
      })
    } catch (e) {
      this.ctx.throw(200, '上传文件失败')
    }
  }
}

module.exports = UploadService

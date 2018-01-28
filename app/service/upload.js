const Service = require('./base')

class UploadService extends Service {

  async index (fileArr) {
    const uploadInfo = await this.ctx.model.Attchment.create(fileArr)
    if (!uploadInfo) throw Error('上传失败')
    return uploadInfo.map(item => {
      return {
        url: item.url
      }
    })
  }
}

module.exports = UploadService

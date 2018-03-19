const Service = require('./base')
const path = require('path')
const fs = require('fs')
const shortid = require('shortid')
const awaitWriteStream = require('await-stream-ready').write
const sendToWormhole = require('stream-wormhole')

class UploadService extends Service {

  async index (needPath = false) {
    try {
      const ctx = this.ctx
      let arr = []
      const stream = await ctx.getFileStream()
      const extname = path.extname(stream.filename)
      const newFilename = shortid.generate() + extname
      const newPath = path.join(this.ctx.app.baseDir, `app/public/static/${newFilename}`)
      const partStream = fs.createWriteStream(newPath)
      try {
        await awaitWriteStream(stream.pipe(partStream))
      } catch (e) {
        await sendToWormhole(stream)
        throw err
      }
      const fileUrl = path.join(this.config.host, `public/static/${newFilename}`)
      arr.push({
        filename: newFilename,
        path: newPath,
        url: `//${fileUrl}`,
        type: stream.mime
      })
      // 文件路径存数据库
      const uploadInfo = await this.ctx.model.Attchment.create(arr)
      if (!uploadInfo) this.ctx.throw(200, '上传文件失败')
      return uploadInfo.map(item => {
        const param = { url: item.url }
        if (needPath) param.path = item.path
        return param
      })
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '上传文件失败')
    }
  }
}

module.exports = UploadService

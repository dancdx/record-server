'use strict'

const path = require('path')
const fs = require('fs')
const shortid = require('shortid')
const awaitWriteStream = require('await-stream-ready').write
const sendToWormhole = require('stream-wormhole')
const BaseController = require('./base')

class UploadController extends BaseController {
  async index() {
    const ctx = this.ctx
    const parts = ctx.multipart()
    let part
    const arr = []
    // parts() return a promise
    while ((part = await parts())) {
      if (part && part.length) {
        // 如果是数组的话是 filed
        throw Error('暂不支持多字段多文件上传')
      } else {
        if (!part.filename) {
          // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
          // 需要做出处理，例如给出错误提示消息
          throw Error('请选择文件后再上传')
        }
        // part 是上传的文件流
        // 文件处理，存储在disk
        const extname = path.extname(part.filename)
        const newFilename = shortid.generate() + extname
        const newPath = path.join(this.ctx.app.baseDir, `app/public/static/${newFilename}`)
        const partStream = fs.createWriteStream(newPath)
        try {
          await awaitWriteStream(part.pipe(partStream))
        } catch (err) {
          await sendToWormhole(part)
          throw err
        }
        const fileUrl = path.join(this.ctx.host, `public/static/${newFilename}`)
        arr.push({
          filename: newFilename,
          path: newPath,
          url: `//${fileUrl}`,
          type: part.mime
        })
      }
    }
    // 文件路径存数据库
    const uploadInfo = await this.service.upload.index(arr)
    if (uploadInfo.length === 1) {
      this.success(uploadInfo[0])
    } else {
      this.success(uploadInfo)
    }
  }
}

module.exports = UploadController

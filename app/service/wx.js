const Service = require('./base')
const crypto = require('crypto')

class WxService extends Service {

  async index (params) {
    const { signature, timestamp, nonce, echostr } = params
    const token = this.config.token
    const oriArray = [ nonce, timestamp, token ]
    oriArray.sort()
    const scyptoString = this.sha1(oriArray.join(''))
    console.log(scyptoString)
    if (signature === scyptoString) {
      return echostr
    }
    return 'fail'
  }

  async token () {
    console.log(this.config.wx)
    const { appid, secret } = this.config.wx
    const result = await this.ctx.curl(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
      { dataType: 'json' })
    console.log(result.data)
    return result.data
  }

  sha1 (str) {
    const md5sum = crypto.createHash('sha1')
    md5sum.update(str)
    str = md5sum.digest('hex')
    return str
  }
}

module.exports = WxService

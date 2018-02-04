const Service = require('./base')
const crypto = require('crypto')

class WxService extends Service {

  async index (params) {
    console.log(params)
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

  sha1 (str) {
    const md5sum = crypto.createHash('sha1')
    md5sum.update(str)
    str = md5sum.digest('hex')
    return str
  }
}

module.exports = WxService

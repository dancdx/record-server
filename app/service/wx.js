const Service = require('./base')

class WxService extends Service {

  async index (params) {
    const { signature, timestamp, nonce, echostr } = params
    const token = this.config.token
    let oriArray = [ nonce, timestamp, token]
    oriArray.sort()
    let scyptoString = this.sha1(oriArray.join(''))
    if (signature == scyptoString) {
      return echostr
    } else {
      return 'fail'
    }
  }

  sha1 (str) {
    let md5sum = crypto.createHash('sha1')
    md5sum.update(str)
    str = md5sum.digest('hex')
    return str
  }
}

module.exports = WxService

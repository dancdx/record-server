const Service = require('./base')
const crypto = require('crypto')
const fs = require('fs')

class WxService extends Service {
  constructor (app) {
    super(app)
    this.retryTime = 0
    const { appid, secret } = this.config.wx
    this.appid = appid
    this.secret = secret
  }

  async index (params) {
    const { signature, timestamp, nonce, echostr } = params
    const token = this.config.token
    const oriArray = [ nonce, timestamp, token ]
    oriArray.sort()
    const scyptoString = this.sha1(oriArray.join(''))
    if (signature === scyptoString) {
      return echostr
    }
    return 'fail'
  }

  // 获取token
  async token () {
    const { appid, secret } = this.config.wx
    try {
      const result = await this.ctx.curl(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
        { dataType: 'json' })
      if (!result || (result.data.errcode && result.data.errcode !== 0)) return await this.retry()
      await fs.writeFileSync('./token', result.data.access_token)
      this.retryTime = 0
      return result.data.access_token
    } catch (e) {
      console.log(e)
      return await this.retry()
    }
  }

  async retry () {
    if (this.retryTime < 5) {
      this.retryTime++
      return await this.token()
    }
  }

  // 创建菜单
  async createMenu () {
    const { appid, secret } = this.config.wx
    try {
      let token = fs.readFileSync('./token')
      if (!token) {
        token = await this.token()
      }
      const result = await this.ctx.curl(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`, {
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify({
          'button': [{
              'name': '果园入口', 
              'type': 'view', 
              // 'url': 'http://hanfeiguoyuan.top'
              // 'url': `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=http%3A%2F%2Fhanfeiguoyuan.top&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
              'url': `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=http%3A%2F%2Fhanfeiguoyuan.top&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
          },
          {
            'name': '测试入口', 
            'type': 'view', 
            // 'url': 'http://hanfeiguoyuan.top'
            // 'url': `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=http%3A%2F%2Fhanfeiguoyuan.top&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
            'url': 'http//test.hanfeiguoyuan.top/login'
        }]
        })
      })
      // console.log(result.data)
      if (result && result.data.errcode === 0) {}
    } catch (e) {
      console.log(e)
    }
  }

  // 授权
  async auth (code) {
    try {
      const { appid, secret } = this.config.wx
      const result = await this.ctx.curl(
        `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`,
        { dataType: 'json' }
      )
      const { access_token, openid } = result.data
      console.log('code-result:====',result.data)
      if (access_token) {
        const userResult = await this.ctx.curl(
          `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`,
          { dataType: 'json' }
        )
        const userInfo = userResult.data
        console.log('access-token:====',userInfo)
        return userInfo
      } else {
        this.ctx.throw(200, '调用微信服务器失败')
      }
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '系统错误，请稍后再试')
    }
  }

  sha1 (str) {
    const md5sum = crypto.createHash('sha1')
    md5sum.update(str)
    str = md5sum.digest('hex')
    return str
  }
}

module.exports = WxService

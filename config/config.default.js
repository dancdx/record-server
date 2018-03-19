'use strict'

module.exports = appInfo => {
  const config = exports = {}

  config.listen = {
    port: 7001,
    hostname: '127.0.0.1'
  }

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1515133826169_7511'

  // wx token
  config.token = 1515133826169

  config.host = 'localhost:7001'
  // config.host = 'http://192.168.0.102:7001'

  config.security = {
    csrf: false
  }

  // add your config here
  config.middleware = [
    // 'saveSession'
  ]

  // mongoose
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/eggs',
    // options: {
    //   useMongoClient: true,
    //   // authSource: 'admin'
    // }
  }

  config.multipart = {
    fileSize: '50mb',
    fileExtensions: [ '.xlsx', '.xls' ], // 增加对 .apk 扩展名的支持
  }

  // error config
  config.onerror = {
    all (err, ctx) {
      if (err.message && err.message.indexOf('已经被注册过') > -1) {
        err.message = '手机号或微信号已经被注册过'
        err.status = 200
      }
      console.log('---', err.message, '---')
      const [ message, code ] = err.message.split(',')
      const res = {
        code: code || -1,
        data: null,
        message: message || 'error'
      }
      ctx.status = err.status || 500
      ctx.body = JSON.stringify(res)
      // if (ctx.status === 200) ctx.body = JSON.stringify(res)
      // else ctx.body = res.toString()
    }
  }

  // session config
  config.session = {
    key: 'RECORD_SESS',
    maxAge: 24 * 3600 * 1000,
    httpOnly: true,
    encrypt: true
  }

  //
  // config.multipart = {}

  config.cors = {
    // origin: '*',
    origin: 'http://localhost:7000',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true
  }

  // config.redis = {
  //   client: {
  //     port: 6379,
  //     host: '127.0.0.1',
  //     password: 'auth',
  //     db: 0
  //   },
  // }

  return config
}

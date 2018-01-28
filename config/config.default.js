'use strict'

module.exports = appInfo => {
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1515133826169_7511'

  config.host = 'localhost:7001'

  config.security = {
    csrf: false
  }

  // add your config here
  config.middleware = [
    'saveSession'
  ]

  // mongoose
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/eggs',
    options: {}
  }

  // error config
  config.onerror = {
    all (err, ctx) {
      console.log('-------------------------------', typeof err)
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
    origin: 'http://localhost:3000',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true
  }

  return config
}

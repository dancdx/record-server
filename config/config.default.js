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
    // origin: 'http://hanfeiguoyuan.top',
    // origin: 'http://hanfei.ngrok.frontjs.cc',
    // origin: 'http://192.168.0.102:7000',
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

  config.wx = {
    appid: 'wx6866af98c236fb7a',
    secret: '939f9dcdf28912500d52da849cd34a50'
  }

  config.express = {
    AppCode: '5a16a8611bd04fa78b06ec55fec920a9',
    AppKey: '24807155',
    AppSecret: 'f54a4b005119a1d46c68faaaaf7852ea'
  }

  return config
}

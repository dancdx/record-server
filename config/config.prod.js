'use strict'

module.exports = appInfo => {
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1515133826169_7511'

  // wx token
  config.token = 1515133826169

  config.host = 'static.hanfeiguoyuan.top'

  config.security = {
    csrf: false
  }

  // add your config here
  config.middleware = [
    'saveSession'
  ]

  // mongoose
  config.mongoose = {
    // url: 'mongodb://127.0.0.1:27017/egg',
    url: 'mongodb://hanfei:hanfei312@127.0.0.1:27017/hanfei',
    options: {
      useMongoClient: true,
      // authSource: 'admin'
    }
  }

  //
  // config.multipart = {}

  config.cors = {
    // origin: '*',
    // origin: 'http://hanfei.frontjs.cc',
    // origin: 'http://localhost:7000',
    origin: 'http://hanfeiguoyuan.top',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true
  }

  return config
}

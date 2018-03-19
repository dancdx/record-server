'use strict'

module.exports = appInfo => {
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1515133826169_7511'

  // wx token
  config.token = 1515133826169

  config.host = '127.0.0.1'

  config.security = {
    csrf: false
  }

  // add your config here
  config.middleware = [
    'saveSession'
  ]

  // mongoose
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/egg',
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
    origin: 'http://localhost:7000',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true
  }

  return config
}

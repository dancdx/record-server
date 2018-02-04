'use strict'

module.exports = appInfo => {
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1515133826169_7511'

  // wx token
  config.token = 1515133826169

  config.host = 'localhost:7001'

  config.security = {
    csrf: false
  }

  // add your config here
  config.middleware = [
    'saveSession'
  ]

  //
  // config.multipart = {}

  config.cors = {
    // origin: '*',
    origin: /\frontjs.cc$/,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true
  }

  return config
}

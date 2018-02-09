'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app

  const {
    home,
    user,
    goods,
    category,
    upload,
    order,
    wx
  } = controller

  router.get('/', home.index)

  router.get('/user', user.index) // 获取下属列表
  router.post('/user/add', user.add)
  router.post('/user/login', user.login)
  router.get('/user/checklist', user.listCheck) // 获取未审核用户列表
  router.get('/user/check', user.check) // 审核

  router.get('/category', category.index)
  router.post('/category/add', category.add)
  router.post('/category/update', category.update)
  router.get('/category/remove/:id', category.remove)
  router.get('/category/:id', category.detail)

  router.get('/goods', goods.index)
  router.post('/goods/add', goods.add)
  router.post('/goods/status', goods.setGoodsStatus)
  router.post('/goods/update', goods.update)
  router.get('/goods/remove', goods.remove)
  router.get('/goods/:id', goods.detail)

  router.post('/upload', upload.index)

  router.get('/order', order.index)
  router.post('/order/add', order.add)
  router.post('/order/update', order.update)
  router.get('/order/check', order.check)
  router.get('/order/download', order.download)
  router.get('/order/:id', order.detail)

  router.get('/wx', wx.index)
  router.get('/wx/token', wx.token)
}

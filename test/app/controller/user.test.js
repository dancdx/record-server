'use strict'

const { app, assert } = require('egg-mock/bootstrap')

describe('test/app/controller/user.test.js', () => {
  // const ctx = app.mockContext()

  it('should post /user/add', async () => {
    await app.httpRequest()
      .post('/user/add')
      .type('form')
      .send({
        username: 'testuser',
        password: '123456'
      })
      .expect(200)
  })

  it('should post /user/login', () => {
    return app.httpRequest()
      .post('/user/login')
      .type('form')
      .send({
        username: 'testuser',
        password: '123456'
      })
      .expect(200)
      .then(res => {
        console.log(res)
      })
  })
})

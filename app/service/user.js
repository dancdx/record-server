const Service = require('./base')

class UserService extends Service {

  async login({ username, password }) {
    const user = await this.ctx.model.User.findOne({ username })
    if (!user) {
      this.ctx.throw(200, '用户名不存在')
    }
    try {
      const isMatch = await user.verifyPassword(password)
      if (!isMatch) {
        this.ctx.throw(200, '密码错误')
      }
    } catch (e) {
      this.ctx.throw(200, '密码错误')
    }
    const { telephone, avatarUrl, role } = user
    return { id: user._id, username, telephone, avatarUrl, role }
  }

  async add (params) {
    const { username, password, telephone, avatarUrl, role, boss } = params
    const user = await this.ctx.model.User.create({
      username,
      password,
      telephone,
      avatarUrl,
      role,
      boss
    })
    return { id: user._id, username, telephone, avatarUrl, role }
  }

}

module.exports = UserService

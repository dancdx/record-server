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
    if (!params || !params.boss) this.ctx.throw(200, '链接非法')
    const { username, telephone, avatarUrl, boss } = params
    // 获取bossInfo
    const bossInfo = await this.ctx.model.User.findById(boss)
    if (!bossInfo) this.ctx.throw(200, '上级ID错误或不存在')
    const bossRole = bossInfo.role
    if (bossRole === 3) this.ctx.throw(200, '上级权限不足，不能添加代理')
    // 根据上级角色设置用户角色
    let role = 3 // 默认特代
    if (bossRole === 1 || bossRole === 0) role = 2
    // 创建用户
    const user = await this.ctx.model.User.create({
      username,
      password: 123456, // 添加只能设置默认密码，需自行修改密码
      telephone,
      avatarUrl,
      role,
      boss
    })
    // 踩坑记录，获取引用然后push，再save
    const newArr = bossInfo.members
    newArr.push(user._id)
    bossInfo.members = newArr
    await bossInfo.save()
    return { id: user._id, username, telephone, avatarUrl, role }
  }

  async list () {
    const curUser = this.ctx.session.user
    if (curUser.role === 3) this.ctx.throw(200, '无下属列表')
    const members = await this.ctx.model.User.findOne({ _id: curUser.id }, 'members').populate({ path: 'members', select: '_id username wx telephone avatarUrl' })
    return members
  }
}

module.exports = UserService

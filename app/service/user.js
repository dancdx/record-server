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
    const { username, telephone, avatarUrl, boss, wx, idCard, idCardDownUrl, idCardUpUrl } = params
    // 获取bossInfo
    const bossInfo = await this.ctx.model.User.findById(boss)
    if (!bossInfo) this.ctx.throw(200, '上级ID错误或不存在')
    const bossRole = bossInfo.role
    if (bossRole === 3) this.ctx.throw(200, '上级权限不足，不能添加代理')
    // 根据上级角色设置用户角色
    let role = 3 // 默认特代
    if (bossRole === 1 || bossRole === 0) role = 2
    let status = role === 2 ? 2 : 1 // 总代状态为总代已审核，特代状态为未审核
    // 创建用户
    const user = await this.ctx.model.User.create({
      username,
      password: 123456, // 添加只能设置默认密码，需自行修改密码
      telephone,
      avatarUrl,
      role,
      boss,
      wx,
      idCard,
      idCardDownUrl,
      idCardUpUrl,
      status
    })
    // 踩坑记录，获取引用然后push，再save
    // const newArr = bossInfo.members
    // newArr.push(user._id)
    // bossInfo.members = newArr
    // await bossInfo.save()
    return { id: user._id, username, telephone, avatarUrl, role }
  }

  // 获取下属列表
  async list () {
    const curUser = this.ctx.session.user
    const curRole = curUser.role
    if (curRole === 3) this.ctx.throw(200, '无下属列表')
    const queryContidion = { _id: curUser.id, status: 0 }
    try {
      const members = await this.ctx.model.User.findOne(
        {...queryContidion}, 'members').populate({
          path: 'members',
          select: '_id username wx telephone avatarUrl'
        })
      return members
    } catch (e) {
      this.ctx.throw(200, '获取用户列表失败')
    }
  }

  // 获取未审核用户列表
  async listCheck () {
    const curUser = this.ctx.session.user
    const curRole = curUser.role
    if (curRole === 3) this.ctx.throw(200, '无权限访问')
    const queryContidion = {}
    try {
      if (curRole === 1) {
        queryContidion = { status: 1 }
      }
      if (curRole === 2) {
        queryContidion = { status: 2, boss: curUser._id }
      }
      const data = await this.ctx.model.User.find({...queryContidion}, '_id username wx telephone idCard idCardDownUrl idCardUpUrl')
      console.log(data)
      return data
    } catch (e) {
      this.ctx.throw(200, '查询失败')
    }
    
  }
}

module.exports = UserService

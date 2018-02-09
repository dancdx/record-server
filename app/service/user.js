const Service = require('./base')
const { role } = require('../extend/constains')
const { ADMIN, ZONGDAI, TEDAI } = role

class UserService extends Service {
  async login ({ username, password }) {
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
    try {
      if (!params || !params.boss) this.ctx.throw(200, '链接非法')
      const { username, telephone, avatarUrl, boss, wx, idCard, idCardDownUrl, idCardUpUrl } = params
      // 获取bossInfo
      const bossInfo = await this.ctx.model.User.findById(boss)
      if (!bossInfo) this.ctx.throw(200, '上级ID错误或不存在')
      const bossRole = bossInfo.role
      if (bossRole === TEDAI) this.ctx.throw(200, '上级权限不足，不能添加代理')
      // 根据上级角色设置用户角色
      let role = TEDAI // 默认特代
      if (bossRole === ADMIN) role = ZONGDAI
      let status = role === ZONGDAI ? 2 : 1 // 总代状态为总代已审核，特代状态为未审核
      // 查找当前申请是否申请过或者已驳回
      const findPreUser = await this.ctx.model.User.find({ telephone })
      if (findPreUser) {
        const status = findPreUser.status
        // 驳回状态则更新申请信息
        if (status === 3) {
          params._id = findPreUser._id
          this.updateAdd(params)
        } else {
          if (status === 0) {
            this.ctx.throw(200, '手机号已注册')
          } else {
            this.ctx.throw(200, '审核中, 请勿重复申请')
          }
        }
      } else {
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
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '申请失败')
    }
  }

  // 更新申请信息
  async updateAdd (params) {
    try {
      const { _id, username, telephone, wx, idCard, idCardDownUrl, idCardUpUrl } = params
      const updateParams = this.helper.merge({ status: 2 }, { username, telephone, wx, idCard, idCardDownUrl, idCardUpUrl })
      const updateInfo = await this.ctx.model.User.findOneAndUpdate(
        { _id },
        {...updateParams},
        {new: true}
      )
      if (updateInfo) {
        return true
      }
    } catch (e) {
      console.log(e)
      this.ctx.throw('操作失败')
    }
  }

  // 获取下属列表
  async list () {
    try {
      const curUser = this.user
      const curRole = curUser.role
      if (curRole === TEDAI) this.ctx.throw(200, '无下属列表')
      const queryContidion = { _id: curUser.id, status: 0 }
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

  // 获取未审核用户列表 | type=1 驳回列表(总代使用)
  async listCheck (type) {
    try {
      const curUser = this.user
      const curRole = curUser.role
      if (curRole === TEDAI) this.ctx.throw(200, '无权限访问')
      let queryContidion = {}
      if (curRole === ADMIN) {
        queryContidion = { status: 1 }
      }
      if (curRole === ZONGDAI) {
        queryContidion = { status: type === 1 ? 3 : 2, boss: curUser.id }
      }
      console.log(curUser, queryContidion)
      const data = await this.ctx.model.User.find(
        {...queryContidion},
        '_id username wx telephone idCard idCardDownUrl idCardUpUrl'
      )
      return data
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '查询失败')
    }
    
  }

  // 用户审核 type = 1 为驳回，默认通过
  async check (id, type) {
    try {
      const curUser = this.user
      const curRole = this.user.role
      if (curRole === TEDAI) this.ctx.throw(200, '权限不足')
      let nextStatus = null
      if (curRole === ADMIN) nextStatus = (type && Number(type) === 1) ? 3 : 0
      if (curRole === ZONGDAI) nextStatus = (type && Number(type) === 1) ? 3 : 1
      const checkUser = await this.ctx.model.User.findOneAndUpdate(
        { _id: id },
        { status: nextStatus },
        { new: true }
      )
      console.log(checkUser)
      // 公司审核通过则添加到对应boss的member里
      if (type !== 1 && curRole === ADMIN) {
        const bossInfo = await this.ctx.model.User.findById(checkUser.boss)
        const newArr = bossInfo.members
        newArr.push(checkUser._id)
        bossInfo.members = newArr
        await bossInfo.save()
      }
      return id
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, '操作失败')
    }
  }
}

module.exports = UserService

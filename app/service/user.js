const Service = require('./base')
const ms = require('ms')
const { role } = require('../extend/constains')
const { ADMIN, ZONGDAI, TEDAI } = role

class UserService extends Service {

  // 授权
  async auth (code) {
    const data = await this.service.wx.auth(code)
    console.log('auth-data:===', data)
    return data
  }

  // 获取用户信息
  async userinfo (code) {
    // 存在session则直接返回
    // if (this.user) return this.user
    // 授权获取用户信息
    const data = await this.auth(code)
    console.log('userinfo-data:===',data)
    const userInfo = await this.ctx.model.User.findOne({ openid: data.openid })
    console.log('userinfo----',userInfo)
    if (!userInfo || userInfo.status !== 0) this.ctx.throw(200, '未授权用户')
    const userInfoClone = userInfo.toObject()
    userInfoClone.id = userInfoClone._id
    const { telephone, avatarUrl, role, boss, username, _id, id } = userInfoClone
    this.ctx.session.user = userInfoClone
    this.ctx.session.maxAge = ms('10d')
    return { telephone, avatarUrl, role, boss, username, id, _id }
  }

  // 登陆
  async login ({ username, password }) {
    const allUser = await this.ctx.model.User.find()
    const user = await this.ctx.model.User.findOne({ username })
    if (!user) {
      this.ctx.throw(200, '用户名不存在')
    }
    if (user.status !== 0) {
      this.ctx.throw(200, '用户审核中')
    }
    try {
      const isMatch = await user.verifyPassword(password)
      if (!isMatch) {
        this.ctx.throw(200, '密码错误')
      }
    } catch (e) {
      this.ctx.throw(200, '密码错误')
    }
    const { telephone, avatarUrl, role, boss } = user
    return { id: user._id, username, telephone, avatarUrl, role, boss }
  }

  // 申请代理
  async add (params) {
    const user_auth = this.ctx.session.user_auth
    if (!user_auth) this.ctx.throw(200, '未授权链接')
    const { openid, nickname, headimgurl } = user_auth
    if (!params || !params.boss || params.boss === 'undefined') this.ctx.throw(200, '链接非法')
    let { username, telephone, avatarUrl, boss, wx, idCard, idCardDownUrl, idCardUpUrl } = params
    avatarUrl = headimgurl
    params.openid = openid
    params.nickname = nickname
    // 获取bossInfo
    const bossInfo = await this.ctx.model.User.findById(boss)
    if (!bossInfo) this.ctx.throw(200, '上级ID错误或不存在')
    const bossRole = bossInfo.role
    if (bossRole === TEDAI) this.ctx.throw(200, '上级权限不足，不能添加代理')
    // 根据上级角色设置用户角色
    let role = TEDAI // 默认特代
    if (bossRole === ADMIN) role = ZONGDAI
    let status = role === ZONGDAI ? 1 : 2 // 总代状态为总代已审核，特代状态为未审核
    //公司或总代主动添加
    // if (this.user) {
    //   status = role === ZONGDAI ? 0 : 1 // 添加总代直接通过，添加特代还需公司审核
    // }
    // 查找当前申请是否申请过或者已驳回
    const findPreUser = await this.ctx.model.User.findOne({ openid })
    console.log(findPreUser)
    if (findPreUser) {
      const status = findPreUser.status
      const originBoss = findPreUser.boss
      // 驳回状态则更新申请信息
      if (status === 3) {
        params._id = findPreUser._id
        params.role = role
        params.originBoss = originBoss
        this.updateAdd(params)
      } else {
        if (status === 0) {
          this.ctx.throw(200, '微信号已注册')
        } else {
          this.ctx.throw(200, '审核中, 请勿重复申请')
        }
      }
    } else {
      try {
        // 创建用户
        const user = await this.ctx.model.User.create({
          username,
          password: 123456, // 添加只能设置默认密码，需自行修改密码
          telephone,
          avatarUrl,
          role,
          boss,
          wx,
          openid,
          nickname,
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
      } catch (e) {
        console.log(e)
        this.ctx.throw(200, e.message || '申请失败')
      }
    }
  }

  // 更新申请信息
  async updateAdd (params) {
    try {
      const { _id, username, boss, originBoss, telephone, wx, idCard, idCardDownUrl, idCardUpUrl, role } = params
      // 如果重新申请的总代跟之前不一致，则从原来的总代里把他删除
      if (boss !== originBoss && originBoss) {
        const originBossInfo = await this.ctx.model.User.findById(originBoss)
        let originBossMembers = originBossInfo.members
        if (originBossMembers && originBossMembers.indexOf(_id) >=0) {
          originBossMembers.splice(index, 1)
          originBossInfo.members = originBossMembers
          await originBossInfo.save()
        }
      }
      const updateParams = this.ctx.helper.merge({ status: 2 }, { username, boss, role, telephone, wx, idCard, idCardDownUrl, idCardUpUrl })
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
      this.ctx.throw(200, e.message || '操作失败')
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
      // let nextStatus = (type && Number(type) === 1) ? 3 : 0 // 总代审核也直接通过
      const checkUser = await this.ctx.model.User.findOneAndUpdate(
        { _id: id },
        { status: nextStatus },
        { new: true }
      )
      // 公司审核通过则添加到对应boss的member里
      if (type !== 1 && curRole === ADMIN) {
        const bossInfo = await this.ctx.model.User.findById(checkUser.boss)
        const newArr = bossInfo.members
        if (newArr && newArr.indexOf(checkUser._id) < 0) {
          newArr.push(checkUser._id)
        }
        bossInfo.members = newArr
        await bossInfo.save()
      }
      return id
    } catch (e) {
      console.log(e)
      this.ctx.throw(200, e.message || '操作失败')
    }
  }

  // 获取用户列表
  async ztlist (params) {
    const queryCondition = { role: params.type !== 2 ? 3 : 2, status: 0 }
    if (params.key) {
      if (this.ctx.helper.reg.telephone.test(key)) {
        queryCondition.telephone = key
      } else {
        queryCondition.username = key
      }
    }
    await this.ctx.model.User.find(queryCondition).populate('boss')
  }
}

module.exports = UserService

const Service = require('./base')

class CategoryService extends Service {

  async index () {
    const user = this.ctx.session.user
    try {
      if (user.role !== 0 || user.role !== 1) this.ctx.throw(200, '权限不足')
      const info = await this.ctx.model.Category.find({}, '_id name')
      return info
    } catch (e) {
      this.ctx.throw(200, '获取列表失败')
    }
  }

  async detail (id) {
    if (!id) this.ctx.throw(200, '请选择一个分类')
    try {
      const info = this.ctx.model.Category.findById(id, '_id name')
      if (!info) this.ctx.throw(200, '无效分类')
      return info
    } catch (e) {
      this.ctx.throw(200, '获取分类失败')
    }
  }

  async add (name) {
    if (!name) this.ctx.throw(200, '请填写至少一个分类')
    if (typeof name === 'string') name = [ name ]
    name = name.map(item => {
      return { name: item }
    })
    try {
      const info = await this.ctx.model.Category.create(name)
      console.log(info)
      if (!info) this.ctx.throw(200, '添加分类失败')
      return info.map(item => {
        return {
          name: item.name,
          id: item.id
        }
      })
    } catch (e) {
      this.ctx.throw(200, '添加分类失败')
    }
  }

  async update (id) {
    if (!id) this.ctx.throw(200, '请选择一个分类')
    try {
      const info = this.ctx.model.Category.findOneAndUpdate({ _id: id }, '_id name', { new: true })
      if (!info) this.ctx.throw(200, '无效分类')
      return info
    } catch (e) {
      this.ctx.throw(200, '修改分类失败')
    }
  }

  async remove (id) {
    if (!id) this.ctx.throw(200, '请选择一个分类')
    try {
      const info = this.ctx.model.Category.findById(id)
      if (!info) this.ctx.throw(200, '无效分类')
      info.remove()
      return 'success'
    } catch (e) {
      this.ctx.throw(200, '删除分类失败')
    }
  }
}

module.exports = CategoryService

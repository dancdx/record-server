'use strict'

const BaseController = require('./base')

class CategoryController extends BaseController {

  async index() {
    const info = await this.service.category.index()
    this.success(info)
  }

  async detail () {
    const { id } = this.ctx.params
    const info = await this.service.category.detail(id)
    this.success(info)
  }

  async add () {
    const { name } = this.ctx.request.body
    const info = await this.service.category.add(name)
    this.success(info)
  }

  async update () {
    const { id, name } = this.ctx.query
    const info = await this.service.category.update(id, name)
    this.success(info)
  }

  async remove () {
    const { id } = this.ctx.params
    await this.service.category.remove(id)
    this.success('success')
  }
}

module.exports = CategoryController

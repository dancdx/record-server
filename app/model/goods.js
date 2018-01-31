'use strict'

module.exports = app => {
  // 获取ctx，小心坑
  // let ctx = null
  // if (app.createAnonymousContext) {
  //   ctx = app.createAnonymousContext()
  // }
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const GoodsSchema = new Schema({
    skuId: { type: Number },
    name: { type: String, required: true },
    image: { type: String, required: true },
    desc: { type: String, default: '' },
    bprice: { type: Number, required: true }, // 进价
    zprice: { type: Number, required: true },
    tprice: { type: Number, required: true },
    lprice: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' }, // 商品分类
    status: { type: Number, default: 0 }, // 0:正常  1:下架
    apply: { type: String } // 供应商
  }, {
    timestamps: true,
  })

  // GoodsSchema.pre('save', function (next) {
  //   console.log(this)
  //   // 添加skuId
  //   const addSkuId = async () => {
  //     let goodsBool = true
  //     let gNum = 0
  //     const bit = 6
  //     let gId
  //     while (goodsBool && gNum < Math.pow(10, bit + 1)) {
  //       gId = ''
  //       for (let index = 0; index < bit; index++) {
  //         gId += Math.floor(Math.random() * 10)
  //       }
  //       goodsBool = await ctx.model.Goods.findOne({ skuId: gId })
  //       gNum++
  //     }
  //     if (gId) {
  //       this.skuId = Number(gId)
  //       next && next()
  //     } else {
  //       throw new Error('商品数量已达上限')
  //     }
  //   }
  //   addSkuId()
  // })

  return mongoose.model('Goods', GoodsSchema)
}

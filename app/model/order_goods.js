'use strict'

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const OrderGoodsSchema = new Schema({
    image: { type: String },
    name: { type: String, default: '' },
    desc: { type: String, default: '' },
    price: { type: String, default: 0 },
    zprice: { type: Number, default: 0 },
    tprice: { type: String, default: 0 },
    category: { type: Number, default: 0 },
    num: { type: Number, default: 1 },
    skuId: { type: Number },
    total: { type: Number }
  }, {
    timestamps: true,
  })

  return mongoose.model('OrderGoods', OrderGoodsSchema)
}

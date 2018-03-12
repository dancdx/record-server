'use strict'

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const OrderGoodsSchema = new Schema({
    image: { type: String },
    name: { type: String, default: '' },
    desc: { type: String, default: '' },
    price: { type: Number, default: 0 },
    bprice: { type: Number, default: 0 },
    zprice: { type: Number, default: 0 },
    tprice: { type: Number, default: 0 },
    lprice: { type: Number, default: 0 },
    category: { type: Number, default: 0 },
    num: { type: Number, default: 1 },
    skuId: { type: Number },
    total: { type: Number },
    ztotal: { type: Number },
    ttotal: { type: Number },
    ltotal: { type: Number },
    apply: { type: String }, // 供应商
    driverNo: { type: String }, // 快递单号
    driverType: { type: String }
  }, {
    timestamps: true,
  })

  return mongoose.model('OrderGoods', OrderGoodsSchema)
}

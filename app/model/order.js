'use strict'

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const OrderSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: Number },
    user: {
      name: { type: String, required: true },
      mobile: { type: Number, required: true },
      address: { type: String, required: true }
    },
    goods: [{ type: Schema.Types.ObjectId, ref: 'OrderGoods' }],
    status: { type: Number, default: 0 }, // 0:未审核(待处理)  1:一级审核(已提交)  2:已审核(已提交) 3:已发货
    total: { type: Number }
  }, {
    timestamps: true,
  })

  OrderSchema.pre('save', function(next) {
    // const order = this
    // console.log(order)
    next()
  })

  return mongoose.model('Order', OrderSchema)
}

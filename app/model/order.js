'use strict'

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const OrderSchema = new Schema({
    ownerBoss: { type: Schema.Types.ObjectId, ref: 'User' }, // 订单创建者的上级
    owner: { type: Schema.Types.ObjectId, ref: 'User' }, // 订单创建者
    orderId: { type: Number },
    user: {
      name: { type: String, required: true },
      mobile: { type: Number, required: true },
      address: { type: String, required: true }
    },
    goods: [{ type: Schema.Types.ObjectId, ref: 'OrderGoods' }],
    status: { type: Number, default: 0 }, // 0:未审核(待处理)  1:总代已审核(已提交)  2:公司已审核(已提交) 3:已发货  4:总代驳回  5:公司驳回
    total: { type: Number }, // 总金额
    btotal: { type: Number } // 总成本
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

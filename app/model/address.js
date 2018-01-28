'use strict'

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const AddressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    mobile: { type: Number, required: true },
    address: { type: String, required: true }
  }, {
    timestamps: true,
  })

  return mongoose.model('Address', AddressSchema)
}

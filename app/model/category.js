'use strict'

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const CategorySchema = new Schema({
    name: { type: String, required: true }
  }, {
    timestamps: true,
  })

  return mongoose.model('Category', CategorySchema)
}

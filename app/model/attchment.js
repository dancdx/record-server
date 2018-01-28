'use strict'

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const AttchmentSchema = new Schema({
    filename: { type: String },
    path: { type: String },
    url: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, default: 'image' }
  }, {
    timestamps: true,
  })

  return mongoose.model('Attachment', AttchmentSchema)
}

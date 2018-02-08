'use strict'

const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const UserSchema = new Schema({
    username: { type: String },
    password: { type: String },
    wx: { type: String, unique: true, sparse: true }, // 微信号
    openid: { type: String, default: '' },
    idCard: { type: String }, // 身份证号
    telephone: { type: Number, unique: true, index: true, sparse: true },
    avatarUrl: { type: String, default: '' }, // 微信头像
    idCardUpUrl: { type: String, default: '' }, // 身份证正面照
    idCardDownUrl: { type: String, default: '' }, // 身份证反面照
    role: { type: Number, default: 3 }, // 0 superadmn   1 admim   2  big   3 small
    boss: { type: Schema.Types.ObjectId, ref: 'User' }, // 上级
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }], // 下级
    status: { type: Number, default: 2 } // 0已审核  1总代已审核  2 未审核
  }, {
    timestamps: true,
  })

  UserSchema.plugin(uniqueValidator, {
    message: '{VALUE} 已经被注册过咯',
  })

  UserSchema.pre('save', function(cb) {
    const user = this
    if (!user.isModified('password')) {
      return cb()
    }
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return cb(err)
      }
      bcrypt.hash(user.password, salt, null, (err, hash) => {
        if (err) {
          return cb(err)
        }
        user.password = hash
        cb()
      })
    })
  })

  UserSchema.methods.verifyPassword = function(password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err) {
          return reject(err)
        }

        resolve(isMatch)
      })
    })
  }

  return mongoose.model('User', UserSchema)
}

'use strict'
module.exports = () => {
  return async function saveSession(ctx, next) {
    await next()
    if (!ctx.session.user) return
    ctx.session.save()
  }
}

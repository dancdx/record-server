module.exports = app => {
  app.beforeStart(async () => {
    const ctx = app.createAnonymousContext()
    await app.runSchedule('update_token')
    await ctx.service.wx.createMenu()
  })
}

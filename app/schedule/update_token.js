module.exports = app => {
  return {
    schedule: {
      interval: '7000s',
      type: 'all'
    },
    async task(ctx) {
      const token = await ctx.service.wx.token()
      ctx.app.token = token
      app.token = token
    }
  }
}

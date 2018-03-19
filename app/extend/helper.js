// 工具方法
const moment = require('moment')
module.exports = {
  formatDate (dateString) {
    // return moment(dateString).format().split('+')[0] + 'Z'
    return new Date(dateString)
  },

  merge (origin, newObj) {
    if (!newObj) return origin
    Object.keys(newObj).map(item => {
      if (item) origin[item] = newObj[item]
      return item
    })
    return origin
  },

  reg: {
    telephone: /^1[34578][0-9]{9}$/
  }
}

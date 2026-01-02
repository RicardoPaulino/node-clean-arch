// const { default: isEmail } = require("validator/lib/isEmail");

module.exports = {
  isEmailValid: true,
  isEmail (email) {
    return this.isEmailValid
  }
}

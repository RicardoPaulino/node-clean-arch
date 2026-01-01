const MissingParamError = require('../errors/missing-param-error')
const InvalidParamError = require('../errors/invalid-param-error')
const UnauthorizedError = require('../errors/unauthorized-error')
const ServerError = require('../errors/server-error')

module.exports = {
  MissingParamError,
  InvalidParamError,
  UnauthorizedError,
  ServerError
}

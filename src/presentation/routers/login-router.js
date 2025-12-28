const httpResponse = require('../helpers/http-responses')

module.exports = class LoginRouter {
  constructor (authUseCaseSpy) {
    this.authUseCaseSpy = authUseCaseSpy
  }

  route (httpRequest) {
    if (!httpRequest) {
      return httpResponse.serverError()
    }
    if (!httpRequest.body) {
      return httpResponse.serverError()
    }
    /* istanbul ignore next */
    const { email, password } = httpRequest.body || {}
    if (!email) {
      return httpResponse.badRequest('email')
    }
    if (!password) {
      return httpResponse.badRequest('password')
    }
    this.authUseCaseSpy.auth(email, password)
    return httpResponse.unauthorizedError()
  }
}

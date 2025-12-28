const httpResponse = require('../helpers/http-responses')

module.exports = class LoginRouter {
  constructor (authUseCaseSpy) {
    this.authUseCaseSpy = authUseCaseSpy
  }

  route (httpRequest) {
    try {
      if (!httpRequest) {
        return httpResponse.serverError()
      }
      if (!httpRequest.body) {
        return httpResponse.serverError()
      }
      if (!this.authUseCaseSpy) {
        return httpResponse.serverError()
      }
      if (!this.authUseCaseSpy.auth) {
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
      const accessToken = this.authUseCaseSpy.auth(email, password)
      if (accessToken) {
        return httpResponse.ok({ accessToken })
      }
      return httpResponse.unauthorizedError()
    } catch (error) {
      return httpResponse.serverError()
    }
  }
}

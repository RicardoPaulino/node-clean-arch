const httpResponse = require('../helpers/http-responses')

module.exports = class LoginRouter {
  constructor (authUseCaseSpy) {
    this.authUseCaseSpy = authUseCaseSpy
  }

  async route (httpRequest) {
    try {
      if (!httpRequest) {
        return await httpResponse.serverError()
      }
      if (!httpRequest.body) {
        return await httpResponse.serverError()
      }
      if (!this.authUseCaseSpy) {
        return await httpResponse.serverError()
      }
      if (!this.authUseCaseSpy.auth) {
        return await httpResponse.serverError()
      }
      /* istanbul ignore next */
      const { email, password } = httpRequest.body || {}
      if (!email) {
        return await httpResponse.badRequest('email')
      }
      if (!password) {
        return await httpResponse.badRequest('password')
      }
      const accessToken = await this.authUseCaseSpy.auth(email, password)
      if (accessToken) {
        return await httpResponse.ok({ accessToken })
      }
      return await httpResponse.unauthorizedError()
    } catch (error) {
      return await httpResponse.serverError()
    }
  }
}

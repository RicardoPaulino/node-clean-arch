const httpResponse = require('../helpers/http-responses')
const MissingParamError = require('../errors/missing-param-error')
const InvalidParamError = require('../errors/invalid-param-error')
module.exports = class LoginRouter {
  constructor (authUseCaseSpy, emailValidatorSpy) {
    this.authUseCaseSpy = authUseCaseSpy
    this.emailValidatorSpy = emailValidatorSpy
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
        return await httpResponse.badRequest(new MissingParamError('email'))
      }
      /* istanbul ignore next */
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return await httpResponse.badRequest(new InvalidParamError('email'))
      }
      if (!this.emailValidatorSpy.isValid(email)) {
        return await httpResponse.badRequest(new InvalidParamError('email'))
      }
      if (!password) {
        return await httpResponse.badRequest(new MissingParamError('password'))
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

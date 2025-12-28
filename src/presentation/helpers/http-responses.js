const MissingParamError = require('./missing-param-error')
module.exports = class httpResponse {
  static badRequest (paramName) {
    return {
      statusCode: 400,
      body: new MissingParamError(paramName)
    }
  }

  static serverError () {
    return {
      statusCode: 500
    }
  }

  /** istabul ignore next */
  static success () {
    return {
      statusCode: 200
    }
  }

  static unauthorizedError () {
    return {
      statusCode: 401
    }
  }

  /** istanbul ignore next */
  static forbiddenError () {
    return {
      statusCode: 403
    }
  }
}

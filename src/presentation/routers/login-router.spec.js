const LoginRouter = require('./login-router')
const { UnauthorizedError, ServerError, MissingParamError } = require('../errors')

// Factory for Email Validator Spy
const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      this.email = email
      return this.isEmailValid
    }
  }
  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

// Factory for Auth UseCase Spy
const makeAuthUseCaseSpy = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }
  return new AuthUseCaseSpy()
}

// Factory for Auth UseCase with Error
const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth () {
      throw new Error()
    }
  }
  return new AuthUseCaseSpy()
}

// Factory for System Under Test
const makeSUT = () => {
  const authUseCaseSpy = makeAuthUseCaseSpy()
  const emailValidatorSpy = makeEmailValidator()
  authUseCaseSpy.accessToken = 'valid_token'
  const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
  return { sut, authUseCaseSpy, emailValidatorSpy }
}

describe('Login Router', () => {
  describe('Missing Parameters Validation', () => {
    test('Should return 400 if no email is provided', async () => {
      const { sut } = makeSUT()
      const httpRequest = {
        body: {
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should return 400 if no password is provided', async () => {
      const { sut } = makeSUT()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })
  })

  describe('HTTP Request Validation', () => {
    test('Should return 500 if no httpRequest is provided', async () => {
      const { sut } = makeSUT()
      const httpResponse = await sut.route(undefined)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should return 500 if httpRequest has no body', async () => {
      const { sut } = makeSUT()
      const httpResponse = await sut.route({})
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    })
  })

  describe('AuthUseCase Integration', () => {
    test('Should call AuthUseCase with correct params', async () => {
      const { sut, authUseCaseSpy } = makeSUT()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      await sut.route(httpRequest)
      expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
      expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
    })

    test('Should return 500 if no AuthUseCase is provided', async () => {
      const emailValidatorSpy = makeEmailValidator()
      const sut = new LoginRouter(undefined, emailValidatorSpy)
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should return 500 if AuthUseCase has no auth method', async () => {
      const emailValidatorSpy = makeEmailValidator()
      const sut = new LoginRouter({}, emailValidatorSpy)
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should return 500 if AuthUseCase throws', async () => {
      const authUseCaseSpy = makeAuthUseCaseWithError()
      const emailValidatorSpy = makeEmailValidator()
      const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    })
  })

  describe('Email Validation', () => {
    test('Should return 400 if email is not valid', async () => {
      const { sut, emailValidatorSpy } = makeSUT()
      emailValidatorSpy.isValid = jest.fn().mockReturnValue(false)
      const httpRequest = {
        body: {
          email: 'invalid_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
    })

    test('Should call EmailValidator with correct email', async () => {
      const { sut, emailValidatorSpy } = makeSUT()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      await sut.route(httpRequest)
      expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
    })
  })

  describe('Authentication Success', () => {
    test('Should return 200 when credentials are valid', async () => {
      const { sut, authUseCaseSpy } = makeSUT()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(200)
      expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
    })
  })

  describe('Authentication Failure', () => {
    test('Should return 401 when invalid credentials are provided', async () => {
      const { sut, authUseCaseSpy } = makeSUT()
      authUseCaseSpy.accessToken = null
      const httpRequest = {
        body: {
          email: 'email@mail.com',
          password: 'any123'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(401)
      expect(httpResponse.body).toEqual(new UnauthorizedError())
    })
  })
})

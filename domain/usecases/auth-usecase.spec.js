const { MissingParamError } = require('../../src/presentation/errors')

class AuthUseCase {
  constructor () {
    this.accessToken = 'valid_token'
  }

  async auth ({ email, password }) {
    if (!email || !password) {
      this.accessToken = null
    }
    if (!email && !password) {
      return new MissingParamError('email or password is missing')
    }
    return this.accessToken
  }
}

describe('Auth UseCase', () => {
  test('Should return null if no email is provider', async () => {
    const sut = new AuthUseCase()
    const accessToken = await sut.auth({
      email: null,
      password: 'any_password'
    })
    expect(accessToken).toBeNull()
  })

  test('Should return null if no password is provider', async () => {
    const sut = new AuthUseCase()
    const accessToken = await sut.auth({
      email: 'any_email@gmail.com',
      password: null
    })
    expect(accessToken).toBeNull()
  })

  test('Should return access token if email and password are provided', async () => {
    const sut = new AuthUseCase()
    const accessToken = await sut.auth({
      email: 'any_email@gmail.com',
      password: 'any_password'
    })
    expect(accessToken).toBe('valid_token')
  })

  test('Should throw if no dependencies are provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth()
    await expect(promise).rejects.toThrow()
  })

  test('Should return MissingParamError if no parameters are provided', async () => {
    const sut = new AuthUseCase()
    const accessToken = await sut.auth({})
    expect(accessToken).toEqual(new MissingParamError('email or password is missing'))
  })
})

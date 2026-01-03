const { MissingParamError } = require('../../src/presentation/errors')

class AuthUseCase {
  constructor () {
    this.accessToken = 'valid_token'
  }

  async auth ({ email, password }) {
    if (!email || !password) {
      throw new MissingParamError(!email ? 'email' : 'password')
    }
    return this.accessToken
  }
}

describe('Auth UseCase', () => {
  // 1. Fixed: await is now on the expect line
  test('Should throw MissingParamError if no email is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth({ password: 'any_password' })
    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  // 2. Fixed: Corrected the "rejects" pattern
  test('Should throw MissingParamError if no password is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth({ email: 'any_email@gmail.com' })
    await expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should return access token if email and password are provided', async () => {
    const sut = new AuthUseCase()
    const accessToken = await sut.auth({
      email: 'any_email@gmail.com',
      password: 'any_password'
    })
    expect(accessToken).toBe('valid_token')
  })

  // 3. This will throw a TypeError: Cannot destructure property 'email' of 'undefined'
  test('Should throw if no parameters are provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth()
    await expect(promise).rejects.toThrow()
  })

  // 4. Fixed: Match the actual error message thrown by your class
  test('Should return MissingParamError email if empty object is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth({})
    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })
})

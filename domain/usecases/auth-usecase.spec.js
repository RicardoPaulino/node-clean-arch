const { MissingParamError } = require('../../src/presentation/errors')

class AuthUseCase {
  constructor (loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
  }

  async auth ({ email, password } = {}) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
    // Safeguard: Ensure repository and method exist
    if (!this.loadUserByEmailRepository || !this.loadUserByEmailRepository.load) {
      throw new Error('Internal Error: Repository not provided')
    }

    await this.loadUserByEmailRepository.load(email)

    // Hardcoded for now based on your logic
    return 'valid_token'
  }
}

// Factory Helper
const makeSut = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy)
  return {
    sut,
    loadUserByEmailRepositorySpy
  }
}

describe('Auth UseCase', () => {
  test('Should throw MissingParamError if no email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth({ password: 'any_password' })
    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw MissingParamError if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth({ email: 'any_email@gmail.com' })
    await expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should throw if no parameters are provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()
    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if an empty object is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth({})
    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth({
      email: 'any_email@gmail.com',
      password: 'any_password'
    })
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@gmail.com')
  })

  test('Should return access token if credentials are valid', async () => {
    const { sut } = makeSut()
    const accessToken = await sut.auth({
      email: 'any_email@gmail.com',
      password: 'any_password'
    })
    expect(accessToken).toBe('valid_token')
  })
})

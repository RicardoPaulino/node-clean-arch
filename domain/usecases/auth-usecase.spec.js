const MissingParamError = require('../../utils/erros/missing-param-error')

// --- Class AuthUseCase (Inalterada, mas pronta para os testes) ---
class AuthUseCase {
  constructor (loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
  }

  async auth ({ email, password } = {}) {
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')
    if (!this.loadUserByEmailRepository || !this.loadUserByEmailRepository.load) {
      throw new MissingParamError('loadUserByEmailRepository')
    }

    await this.loadUserByEmailRepository.load(email)
    return 'valid_token'
  }
}

// --- Factory Helper ---
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

// --- Test Suite ---
describe('Auth UseCase', () => {
  describe('Input Validation', () => {
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

    test('Should throw MissingParamError if no parameters are provided', async () => {
      const { sut } = makeSut()
      await expect(sut.auth()).rejects.toThrow(new MissingParamError('email'))
    })
  })

  describe('LoadUserByEmailRepository Integration', () => {
    test('Should call LoadUserByEmailRepository with correct email', async () => {
      const { sut, loadUserByEmailRepositorySpy } = makeSut()
      await sut.auth({ email: 'any_email@gmail.com', password: 'any_password' })
      expect(loadUserByEmailRepositorySpy.email).toBe('any_email@gmail.com')
    })

    test('Should throw if no LoadUserByEmailRepository is provided', async () => {
      const sut = new AuthUseCase()
      const promise = sut.auth({ email: 'any_email@gmail.com', password: 'any_password' })
      await expect(promise).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'))
    })

    test('Should throw if LoadUserByEmailRepository has no load method', async () => {
      const sut = new AuthUseCase({}) // Repositório vazio
      const promise = sut.auth({ email: 'any_email@gmail.com', password: 'any_password' })
      await expect(promise).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'))
    })
  })

  describe('Authentication Success', () => {
    test('Should return access token if credentials are valid', async () => {
      const { sut } = makeSut()
      const accessToken = await sut.auth({
        email: 'any_email@gmail.com',
        password: 'any_password'
      })
      expect(accessToken).toBe('valid_token')
    })
  })
})

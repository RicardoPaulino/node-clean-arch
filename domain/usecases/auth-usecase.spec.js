const { MissingParamError } = require('../../utils/erros')
const AuthUseCase = require('./auth-usecase')

// --- Factory Helper ---
const makeEncrypter = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }
  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.isValid = true
  return encrypterSpy
}
const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'
  return tokenGeneratorSpy
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  }
  return loadUserByEmailRepositorySpy
}

const makeSut = () => {
  const encryptedSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const tokenGeneratorSpy = makeTokenGenerator()
  const sut = new AuthUseCase(
    loadUserByEmailRepositorySpy,
    encryptedSpy,
    tokenGeneratorSpy
  )
  return {
    sut,
    loadUserByEmailRepositorySpy,
    encryptedSpy,
    tokenGeneratorSpy
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
      await sut.auth({
        email: 'any_email@gmail.com',
        password: 'any_password'
      })
      expect(loadUserByEmailRepositorySpy.email).toBe('any_email@gmail.com')
    })

    test('Should throw if no LoadUserByEmailRepository is provided', async () => {
      const sut = new AuthUseCase()
      const promise = sut.auth({
        email: 'any_email@gmail.com',
        password: 'any_password'
      })
      await expect(promise).rejects.toThrow()
    })

    test('Should throw if LoadUserByEmailRepository has no load method', async () => {
      const sut = new AuthUseCase({}) // Repositório vazio
      const promise = sut.auth({
        email: 'any_email@gmail.com',
        password: 'any_password'
      })
      await expect(promise).rejects.toThrow()
    })

    test('Should return null if an invalid email is provided', async () => {
      const { sut, loadUserByEmailRepositorySpy } = makeSut()
      loadUserByEmailRepositorySpy.user = null
      const accessToken = await sut.auth({
        email: 'invalid_email@gmail.com',
        password: 'any_password'
      })
      expect(accessToken).toBeNull()
    })

    test('Should return null if an invalid password is provided', async () => {
      const { sut, encryptedSpy } = makeSut()
      encryptedSpy.isValid = false
      const accessToken = await sut.auth({
        email: 'valid_email@gmail.com',
        password: 'invalid_password'
      })
      expect(accessToken).toBeNull()
    })

    test('Should call Encrypter if valid credentials are provided', async () => {
      const { sut, loadUserByEmailRepositorySpy, encryptedSpy } = makeSut()
      loadUserByEmailRepositorySpy.user = { password: 'hashed_password' }
      await sut.auth({
        email: 'valid_email@gmail.com',
        password: 'any_password'
      })
      expect(encryptedSpy.password).toBe('any_password')
      expect(encryptedSpy.hashedPassword).toBe(
        loadUserByEmailRepositorySpy.user.password
      )
    })

    test('Should call TokenGenerator if valid credentials are provided', async () => {
      const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } =
        makeSut()
      loadUserByEmailRepositorySpy.user = { password: 'hashed_password' }
      await sut.auth({
        email: 'any_email@gmail.com',
        password: 'any_password'
      })
      expect(tokenGeneratorSpy.userId).toBe(
        loadUserByEmailRepositorySpy.user.id
      )
    })

    describe('Authentication Success', () => {
      test('Should return an access token if valid credentials are provided', async () => {
        const { sut, tokenGeneratorSpy } = makeSut()
        const accessToken = await sut.auth({
          email: 'any_email@gmail.com',
          password: 'any_password'
        })
        expect(accessToken).toBe(tokenGeneratorSpy.accessToken)
        expect(accessToken).toBeTruthy()
      })
    })
  })
})

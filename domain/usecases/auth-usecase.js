const { MissingParamError } = require('../../utils/erros')

module.exports = class AuthUseCase {
  constructor (loadUserByEmailRepository, encrypted, tokenGenerator) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypted = encrypted
    this.tokenGenerator = tokenGenerator
  }

  async auth ({ email, password } = {}) {
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')
    const user = await this.loadUserByEmailRepository.load(email)
    if (!user) return null
    const isValid = await this.encrypted.compare(password, user.password)
    if (!isValid) return null
    const accessToken = await this.tokenGenerator.generate(user.id)
    return accessToken
  }
}

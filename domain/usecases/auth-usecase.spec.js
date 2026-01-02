class AuthUseCase {
  constructor () {
    this.accessToken = 'valid_token'
  }

  async auth ({ email, password }) {
    if (!email || !password) {
      this.accessToken = null
    }
    return this.accessToken
  }
}

describe('Auth UseCase', () => {
  test('Should return null if no email is provider', async () => {
    const sut = new AuthUseCase()
    const accessToken = await sut.auth({ email: null, password: 'any_password' })
    expect(accessToken).toBeNull()
  })

  test('Should return null if no password is provider', async () => {
    const sut = new AuthUseCase()
    const accessToken = await sut.auth({ email: 'any_email@gmail.com', password: null })
    expect(accessToken).toBeNull()
  })
})

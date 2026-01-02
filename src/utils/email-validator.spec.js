class EmailValidator {
  isValid (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

describe('Email Validator', () => {
  test('should return true if validator returns true', () => {
    const sut = new EmailValidator()
    const isEmailValid = sut.isValid('valid_email@gmail.com')
    expect(isEmailValid).toBe(true)
  })
  test('should return false if validator returns false', () => {
    const sut = new EmailValidator()
    const isEmailValid = sut.isValid('invalid_email.com')
    expect(isEmailValid).toBe(false)
  })
})

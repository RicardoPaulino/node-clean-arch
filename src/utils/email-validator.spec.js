const validator = require('validator')

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

// Factory for System Under Test
const makeSUT = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  describe('Valid Email Detection', () => {
    test('should return true if validator returns true', () => {
      const sut = makeSUT()
      const isEmailValid = sut.isValid('valid_email@gmail.com')
      expect(isEmailValid).toBe(true)
    })

    test('should return true for valid email format', () => {
      const sut = makeSUT()
      const isEmailValid = sut.isValid('test@example.com')
      expect(isEmailValid).toBe(true)
    })

    test('should return false when validator returns false', () => {
      const sut = makeSUT()
      jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
      const isEmailValid = sut.isValid('some_text')
      expect(isEmailValid).toBe(false)
    })

    test('should return true for valid email with special chars', () => {
      const sut = makeSUT()
      const isEmailValid = sut.isValid('user+tag@example.com')
      expect(isEmailValid).toBe(true)
    })
  })

  describe('Validator Integration', () => {
    test('should call validator with correct email', () => {
      const sut = makeSUT()
      const isEmailSpy = jest.spyOn(validator, 'isEmail')
      sut.isValid('valid_email@gmail.com')
      expect(isEmailSpy).toHaveBeenCalledWith('valid_email@gmail.com')
      isEmailSpy.mockRestore()
    })

    test('should throw if validator throws', () => {
      const sut = makeSUT()
      jest.spyOn(validator, 'isEmail').mockImplementationOnce(() => {
        throw new Error()
      })
      expect(() => sut.isValid('invalid_email.com')).toThrow()
    })
  })
})

class LoginRouter {
    route(httpRequest) {
        if (!httpRequest.body.email) {
            return {
                statusCode: 400
            }
        }
    }
}

describe('Login Router', () => {
  test('should rturn 400 if no email is provided', () => {
    const sut = new LoginRouter()
    const httpRequest = {
        body:{
            password: 'any_password'
        }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    //expect(httpResponse.body).toEqual(new MissingParamError('email'))
   
  })   
})
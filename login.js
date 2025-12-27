const express = require('express')
const router = express.Router()

module.exports = () => {
  const router = new SignUpRouter()
  router.post('/signup', ExpressRouterAdapter.adapt(router))
}

class ExpressRouterAdapter {
  static adapt (router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body
      }
      const httpResponse = await router.route(httpRequest)
      res.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}

class SignUpRouter {
  async route (httpRequest) {
    const { email, password, repeatPassword } = httpRequest.body
    const user = await new SignUpUseCase().signUp(email, password, repeatPassword)
    return {
      statusCode: 200,
      body: user
    }
  }
}

class SignUpUseCase {
  async signUp (email, password, repeatPassword) {
    if (password === repeatPassword) {
      new AddAccountRepository().addAccount(email, password, repeatPassword)
    }
  }
}

const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')
class AddAccountRepository {
  async addAccount (email, password, repeatPassword) {
    const user = await AccountModel.create({ email, password })
    return user
  }
}

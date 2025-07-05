const AuthController = require('./../controllers/AuthController');
const express = require('express');
const UserRouter = express.Router();

UserRouter.route('/sign-up').post(AuthController.signUp);
UserRouter.route('/login').post(AuthController.logIn);

module.exports = UserRouter;

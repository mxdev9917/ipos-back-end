const express = require('express');
const ownerService = require('./services/ownerSevice');
const userService = require('./services/userService');
const userAdminService = require('./services/userAdminService');
const middlewares = require('./middlewares/middleware');
const verifyToken = require('./utils/verifyToken');
const resService = require('./services/restaurantService');
const categoryService = require('./services/categorsService');
// const { verifyToken } = require('./utils/encrypt');

const Router = express.Router();
Router.param('id', middlewares.checkID); // check pararm ID

// all router owner
Router.route('/').get(ownerService.Ownertest)
Router.route('/owner/signin')
    .post(middlewares.checkBodyNull, ownerService.signInOwner)
Router.route('/owner')
    .get(verifyToken.verifyToken, ownerService.getAllOwner)
    .post(middlewares.checkBodyNull, ownerService.createOwner);
Router.route('/owner/:id')
    .patch(middlewares.checkID, verifyToken.verifyToken, ownerService.updateOwner)
    .delete(middlewares.checkID, verifyToken.verifyToken, ownerService.deleteOwnerById)
    .get(middlewares.checkID, verifyToken.verifyToken, ownerService.getOwnerById);
Router.route('/owner/lock/:id')
    .patch(middlewares.checkID, verifyToken.verifyToken, middlewares.checkBodyNull, ownerService.lockOwner);
// all router user admin


Router.route('/user-admin/signin')
    .post(middlewares.checkBodyNull, userAdminService.signInUserAdmin)
Router.route('/user-admin')
    .get(verifyToken.verifyToken, userAdminService.getAllUserAdmin)
    .post(middlewares.checkBodyNull, verifyToken.verifyToken, userAdminService.createUserAdmin)
Router.route('/user-admin/:id')
    .get(middlewares.checkID, verifyToken.verifyToken, userAdminService.getUserAminById)
    .patch(middlewares.checkID, verifyToken.verifyToken, middlewares.checkBodyNull, userAdminService.updateUserAdmin)
    .delete(middlewares.checkID, verifyToken.verifyToken, userAdminService.deleteUserAdmin)

// all router Restaurant 
Router.route('/restaurant')
    .post(middlewares.checkBodyNull, resService.createRas)
    .get(verifyToken.verifyToken, resService.getAllRes)
Router.route('/restaurant/:id')
    .delete(middlewares.checkID, verifyToken.verifyToken, resService.deleteRes)
    .patch(middlewares.checkID, verifyToken.verifyToken, middlewares.checkBodyNull, resService.updateRes)

// all router Users
Router.route('/user')
    .post(middlewares.checkBodyNull, userService.createUser)

Router.route('/checkuser')
    .post(userService.checkUser)
Router.route('/user/:id')
    .patch(middlewares.checkBodyNull, middlewares.checkID, userService.editUser)
    .get(middlewares.checkID, userService.getAllUserById)
    .delete(middlewares.checkID, userService.deleteUser);
Router.route('/getuser/:id')
    .get(middlewares.checkID, userService.getUserById)
Router.route('/user/reset/:id')
    .patch(middlewares.checkID, userService.resetPassword)
Router.route('/user/update/status/:id')
    .patch(userService.updateStatus);


Router.route('/restaurant/cetegory/all/:id')
    .get(middlewares.checkID, categoryService.gatAllCategory)
module.exports = Router;







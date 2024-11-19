const express = require('express');
const ownerService = require('./services/ownerSever')
const userAdminService = require('./services/userAdminService')
const middlewares = require('./middlewares/middleware')
const userAdminVerifyToken = require('./utils/verifyToken')
const resService = require('./services/restaurantService');
const { verifyToken } = require('./utils/encrypt');

const Router = express.Router();
Router.param('id', middlewares.checkID); // check pararm ID

// all router owner
Router.route('/').get(ownerService.Ownertest) 
Router.route('/owner/signin')
    .post(middlewares.checkBodyNull, ownerService.signInOwner)
Router.route('/owner/')
    .get(userAdminVerifyToken.userAdminVerifyToken,ownerService.getAllOwner)
    .post(middlewares.checkBodyNull, ownerService.createOwner);
Router.route('/owner/:id')
    .patch(middlewares.checkID, ownerService.updateOwner)
    .delete(middlewares.checkID, ownerService.deleteOwnerById)
    .get(middlewares.checkID, userAdminVerifyToken.userAdminVerifyToken,ownerService.getOwnerById);
Router.route('/owner/lock/:id')
    .patch(middlewares.checkID,middlewares.checkBodyNull,ownerService.lockOwner);
// all router user admin


Router.route('/user-admin/signin')
    .post(middlewares.checkBodyNull, userAdminService.signInUserAdmin)
Router.route('/user-admin')
    .get(userAdminService.getAllUserAdmin)
    .post(middlewares.checkBodyNull, userAdminService.createUserAdmin)
Router.route('/user-admin/:id')
    .get(middlewares.checkID, userAdminVerifyToken.userAdminVerifyToken, userAdminService.getUserAminById)
    .patch(middlewares.checkID, middlewares.checkBodyNull, userAdminService.updateUserAdmin)
    .delete(middlewares.checkID, userAdminService.deleteUserAdmin)

// all router Restaurant 
Router.route('/restaurant')
    .post(middlewares.checkBodyNull, resService.createRas)
    .get(resService.getAllRes)
// Router.route('/restaurant/signin')
//     .post(middlewares.checkBodyNull, resService.signInRes)
Router.route('/restaurant/:id')
    .delete(middlewares.checkID, resService.deleteRes)
    .patch(middlewares.checkID, middlewares.checkBodyNull, resService.updateRes)

    
module.exports = Router;


// bearer
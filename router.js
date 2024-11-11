const express = require('express');
const ownerService = require('./services/ownerSever')
const userAdminService = require('./services/userAdminService')
const middlewares = require('./middlewares/middleware')
const userAdminVerifyToken=require('./utils/verifyToken')

const Router = express.Router();
Router.param('id', middlewares.checkID); // check pararm ID

// all router owner 

Router.route('/owner/')
    .get(ownerService.getAllOwner)
    .post(middlewares.checkBodyNull, ownerService.createOwner);
Router.route('/owner/:id')
    .patch(middlewares.checkID, ownerService.updateOwner)
    .delete(middlewares.checkID, ownerService.deleteOwnerById)
    .get(middlewares.checkID, ownerService.getOwnerById);
// all router user admin


Router.route('/user-admin/signin')
    .post(middlewares.checkBodyNull, userAdminService.signInUserAdmin)
Router.route('/user-admin')
    .get(userAdminService.getAllUserAdmin)
    .post(middlewares.checkBodyNull, userAdminService.createUserAdmin)

Router.route('/user-admin/:id')
    .get(middlewares.checkID,userAdminVerifyToken.userAdminVerifyToken, userAdminService.getUserAminById)
    .patch(middlewares.checkID, middlewares.checkBodyNull, userAdminService.updateUserAdmin)
    .delete(middlewares.checkID, userAdminService.deleteUserAdmin)

module.exports = Router;


// bearer
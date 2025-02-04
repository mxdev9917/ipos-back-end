const express = require('express');
const ownerService = require('./services/ownerSevice');
const userService = require('./services/userService');
const userAdminService = require('./services/userAdminService');
const middlewares = require('./middlewares/middleware');
const verifyToken = require('./utils/verifyToken');
const resService = require('./services/restaurantService');
const categoryService = require('./services/categorsService');
const tableService = require('./services/tableSevice');
const productService = require('./services/products');
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


Router.route('/category/all/:id')
    .get(middlewares.checkID, categoryService.gatAllCategory)
Router.route('/category')
    .post(middlewares.checkBodyNull, categoryService.createCategory)
   
Router.route('/category/:id')
    .get(middlewares.checkID, categoryService.getCategoryById)
    .patch(middlewares.checkBodyNull, middlewares.checkID, categoryService.editCategory)
    .delete(middlewares.checkID, categoryService.deleteCategory)
Router.route('/category/status/:id')
    .patch(middlewares.checkBodyNull, middlewares.checkID, categoryService.editStatusCategory)
    .get(middlewares.checkBodyNull, categoryService.getCategoryByStatus)

Router.route('/table/all/:id')
    .get(middlewares.checkBodyNull, middlewares.checkID, tableService.getAlltable)
Router.route('/table/status/:id')
    .patch(middlewares.checkBodyNull, middlewares.checkID, tableService.editStatusTable)
Router.route('/table/:id')
    .delete(middlewares.checkID, tableService.deleteTable)
    .patch(middlewares.checkBodyNull, middlewares.checkID, tableService.editTable)
Router.route('/table')
    .post(middlewares.checkBodyNull, middlewares.checkID, tableService.createTable)

Router.route('/product/all/:id')
    .get(middlewares.checkID, productService.getAllProduct)
Router.route('/product')
    .post(middlewares.checkBodyNull, productService.createProduct)
    .patch(middlewares.checkBodyNull,middlewares.checkID,productService.editProduct)
Router.route('/product/:id')
    .delete(middlewares.checkID, productService.deleteProduct)
    .get(middlewares.checkID,productService.getByIdProduct)
Router.route('/product/status/:id')
    .patch(middlewares.checkID, middlewares.checkBodyNull, productService.editStatusProduct)




module.exports = Router;







const express = require('express');
const ownerService = require('./services/ownerSevice');
const userService = require('./services/userService');
const userAdminService = require('./services/userAdminService');
const middlewares = require('./middlewares/middleware');
const verifyToken = require('./utils/verifyToken');
const resService = require('./services/restaurantService');
const categoryService = require('./services/categorsService');
const tableService = require('./services/tableSevice');
const foodService = require('./services/foodService');
const gallery = require('./services/galleryService')
const orderService = require('./services/orderService');
const rateService = require('./services/exchangeRateSever')
const reportService = require('./services/reportService');
const dashboardService = require('./services/dashboard');
const kitchenService = require('./services/kitchenService');

// const { verifyToken } = require('./utils/encrypt');

const Router = express.Router();
Router.param('id', middlewares.checkID); // check pararm ID
// all router Gallery 

Router.route('/gallery')
    .get(gallery.getAllGallery)

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
Router.route('/restaurant/signin')
    .post(middlewares.checkBodyNull, resService.signInRes)
Router.route('/restaurant')
    .post(middlewares.checkBodyNull, verifyToken.verifyToken, resService.createRas)
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
    .patch(middlewares.checkBodyNull, middlewares.checkID, categoryService.editCategory)
Router.route('/category/:id')
    .get(middlewares.checkID, categoryService.getCategoryById)

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
    .get(middlewares.checkID, tableService.getAllTableByStatus)
Router.route('/table')
    .post(middlewares.checkBodyNull, middlewares.checkID, tableService.createTable)
Router.route('/table/all/status/busy')
    .get(tableService.getAlltableByStatusBusy)

Router.route('/food/all/category/:id')
    .get(middlewares.checkID, foodService.getByIdCategory)
Router.route('/food/all/:id')
    .get(middlewares.checkID, foodService.getAllfood)
Router.route('/food')
    .post(middlewares.checkBodyNull, foodService.createfood)
    .patch(middlewares.checkBodyNull, middlewares.checkID, foodService.editfood)
Router.route('/food/:id')
    .delete(middlewares.checkID, foodService.deletefood)
    .get(middlewares.checkID, foodService.getByIdfood)
Router.route('/food/status/:id')
    .patch(middlewares.checkID, middlewares.checkBodyNull, foodService.editStatusfood)
    .get(middlewares.checkID, foodService.getFoodByStatus)

//  all router Orders 
Router.route('/order')
    .post(middlewares.checkBodyNull, orderService.createOrder)
Router.route('/cancel/order/:id')
    .delete(middlewares.checkBodyNull, orderService.cancelOrder)
Router.route('/menu/item')
    .post(middlewares.checkBodyNull, orderService.createMenuItem)
Router.route('/menu/item/:id')
    .get(middlewares.checkID, orderService.getMenuItem)
    .delete(middlewares.checkID, orderService.deleteMenuItem)
Router.route('/success/order')
    .post(middlewares.checkBodyNull, orderService.successOrder)
Router.route('/table/included')
    .post(middlewares.checkBodyNull, orderService.TableIncluded)

Router.route('/rate')
    .post(middlewares.checkBodyNull, rateService.createRate)
Router.route('/rate/:id')
    .get(middlewares.checkID, rateService.gatRate)
    .delete(middlewares.checkID, rateService.deleteRate)
    .patch(middlewares.checkBodyNull, middlewares.checkID, rateService.editRate)
Router.route('/rate/status/:id')
    .patch(middlewares.checkBodyNull, middlewares.checkID, rateService.editStatusRate)
    .get(middlewares.checkID, rateService.getRateByStatus)


Router.route("/report/food/sale/:id")
    .get(middlewares.checkBodyNull, middlewares.checkID, reportService.getFoodSales)
module.exports = Router;

Router.route("/dashboard/:id")
    .post(middlewares.checkBodyNull, middlewares.checkID, dashboardService.getDashboard)


Router.route("/kitchen/menu/:id")
    .post(middlewares.checkID, middlewares.checkBodyNull, kitchenService.getMenuAll)






const express = require('express');
const ownerService = require('./services/ownerSever')
const middlewares = require('./middlewares/middleware')

const ownerRouter = express.Router();
ownerRouter.param('id', middlewares.checkID);
ownerRouter.route('/')
    .get(ownerService.getAllOwner)
    .post(middlewares.checkBodyNull, ownerService.createOwner);
ownerRouter.route('/:id')
    .patch(middlewares.checkID, ownerService.updateOwner)
    .delete(middlewares.checkID, ownerService.deleteOwnerById)
    .get(middlewares.checkID, ownerService.getOwnerById);
module.exports = ownerRouter;

const OrderService = require("../services/order.service");
const BaseController = require("./base");


class OrderController extends BaseController {
    async createOrder(req, res){
        const orderService = new OrderService()
        const createOrder = await orderService.createOrder(req)
        if(!createOrder.success){
            return BaseController.sendFailedResponse(res, createOrder.data)
        }
        return BaseController.sendSuccessResponse(res, createOrder.data)
    }
    async getUserOrders(req, res){
        const orderService = new OrderService()
        const getUserOrders = await orderService.getUserOrders(req)
        if(!getUserOrders.success){
            return BaseController.sendFailedResponse(res, getUserOrders.data)
        }
        return BaseController.sendSuccessResponse(res, getUserOrders.data)
    }
    async getOrderById(req, res){
        const orderService = new OrderService()
        const getOrderById = await orderService.getOrderById(req)
        if(!getOrderById.success){
            return BaseController.sendFailedResponse(res, getOrderById.data)
        }
        return BaseController.sendSuccessResponse(res, getOrderById.data)
    }
    async getAllOrders(req, res){
        const orderService = new OrderService()
        const getAllOrders = await orderService.getAllOrders(req)
        if(!getAllOrders.success){
            return BaseController.sendFailedResponse(res, getAllOrders.data)
        }
        return BaseController.sendSuccessResponse(res, getAllOrders.data)
    }
}

module.exports = OrderController;
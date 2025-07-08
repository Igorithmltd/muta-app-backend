
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
}

module.exports = OrderController;
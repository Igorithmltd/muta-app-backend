const CartService = require("../services/cart.service");
const BaseController = require("./base");


class CartController extends BaseController {
    async addToCart(req, res){
        const cartService = new CartService()
        const addToCart = await cartService.addToCart(req)
        if(!addToCart.success){
            return BaseController.sendFailedResponse(res, addToCart.data)
        }
        return BaseController.sendSuccessResponse(res, addToCart.data)
    }
    async removeFromCart(req, res){
        const cartService = new CartService()
        const removeFromCart = await cartService.removeFromCart(req)
        if(!removeFromCart.success){
            return BaseController.sendFailedResponse(res, removeFromCart.data)
        }
        return BaseController.sendSuccessResponse(res, removeFromCart.data)
    }
    async updateCart(req, res){
        const cartService = new CartService()
        const updateCart = await cartService.updateCart(req)
        if(!updateCart.success){
            return BaseController.sendFailedResponse(res, updateCart.data)
        }
        return BaseController.sendSuccessResponse(res, updateCart.data)
    }
    async getCart(req, res){
        const cartService = new CartService()
        const getCart = await cartService.getCart(req)
        if(!getCart.success){
            return BaseController.sendFailedResponse(res, getCart.data)
        }
        return BaseController.sendSuccessResponse(res, getCart.data)
    }
}

module.exports = CartController;
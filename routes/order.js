const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");
const { ROUTE_CREATE_ORDER } = require("../util/page-route");


router.post(ROUTE_CREATE_ORDER, auth, (req, res)=>{
    const orderController = new OrderController();
    return orderController.createOrder(req, res);
});

module.exports = router;
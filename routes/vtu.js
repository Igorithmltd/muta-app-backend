const VTUController = require('../controllers/vtu.controller')
const auth = require('../middlewares/auth')
const { ROUTE_PAYCONNECT_GET_NETWORK, ROUTE_PAYCONNECT_DATA, ROUTE_PAYCONNECT_AIRTIME, ROUTE_PAYCONNECT_GET_USER } = require('../util/page-route')

const router = require('express').Router()

router.get(ROUTE_PAYCONNECT_GET_USER, (req, res)=>{
    const vTUController = new VTUController()
    return vTUController.getUserDetails(req, res)
})
router.get(ROUTE_PAYCONNECT_GET_NETWORK, (req, res)=>{
    const vTUController = new VTUController()
    return vTUController.getNetwork(req, res)
})
router.post(ROUTE_PAYCONNECT_DATA, [auth],(req, res)=>{
    const vTUController = new VTUController()
    return vTUController.buyData(req, res)
})
router.get(ROUTE_PAYCONNECT_DATA, [auth],(req, res)=>{
    const vTUController = new VTUController()
    return vTUController.queryDataTransactions(req, res)
})
router.post(ROUTE_PAYCONNECT_AIRTIME, [auth],(req, res)=>{
    const vTUController = new VTUController()
    return vTUController.buyAirtime(req, res)
})


module.exports = router
const ChallengeController = require('../controllers/challenge.controller')
const auth = require('../middlewares/auth')
const { ROUTE_CHALLENGES } = require('../util/page-route')

const router = require('express').Router()

router.post(ROUTE_CHALLENGES, auth,(req, res)=>{
    const challengeController = new ChallengeController()
    return challengeController.createChallenge(req, res)
})

module.exports = router
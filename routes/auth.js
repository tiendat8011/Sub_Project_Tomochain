const express = require('express');
const router = express.Router();


const { signup, signin, getBalance, tradeToken, mintToken ,getUser} = require('../controllers/auth');

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/getBalance', getBalance);
router.post('/tradeToken', tradeToken);
router.post('/mintToken', mintToken);
router.get('/getUser', getUser);




module.exports = router;
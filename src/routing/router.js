var express = require('express');
var router = express.Router();

const routeManager = require('./routeManager');
const validateCards = require('../cards/validateDeckController');
const searchCards = require('../cards/findCardController');

router.get('/',function(req,res,next){
  res.send ("beating...")
});

router.post('/validate',routeManager(validateCards));
router.get('/search',routeManager(searchCards));

module.exports = router;

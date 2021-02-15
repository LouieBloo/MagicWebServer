var express = require('express');
var router = express.Router();

const routeManager = require('./routeManager');
const validateCards = require('../cards/validateDeckController');

router.post('/validate',routeManager(validateCards));

module.exports = router;

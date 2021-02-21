const mongoose = require('mongoose');
const CardModel = mongoose.model('cards');
const { check } = require('express-validator');

module.exports.validation = [
  check('search').isString().withMessage("Invalid Search String")
];
module.exports.handler = async (req, res, next) => {

  let foundCards = await CardModel.find({ $text: { $search: "\"" + req.validParams.search + "\"" } }).limit(50);
  return { status: 200, response: {cards:foundCards} }
}

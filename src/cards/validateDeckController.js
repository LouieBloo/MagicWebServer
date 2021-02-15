const mongoose = require('mongoose');
const CardModel = mongoose.model('cards');
const { check } = require('express-validator');

module.exports.validation = [
  check('deck').isString().withMessage("Deck must be an array")
];
module.exports.handler = async (req, res, next) => {

  let splitDeck = req.validParams.deck.split(/\r?\n/);
  let deck = [];
  let errors = [];

  for (let x = 0; x < splitDeck.length; x++) {
    let amount = splitDeck[x].split(/ (.+)/)[0] || "";
    amount = amount.replace(/\D/g, '');
    if (!amount) {
      errors.push("No amount for: " + splitDeck[x])
      continue;
    }

    let cardName = splitDeck[x].split(/ (.+)/)[1];
    if (!cardName) {
      errors.push("No name for: " + splitDeck[x])
      continue;
    }
    console.log(amount + ": " + cardName);

    //let foundCard = await CardModel.findOne({name:cardName});
    let foundCard = await CardModel.findOne({ $text: { $search: cardName } });

    if (!foundCard) {
      errors.push("Couldnt find: " + splitDeck[x])
      continue;
    }

    deck.push({card:foundCard,amount:amount})

  }

  return { status: 200, response: { errors: errors, deck: deck } }
}
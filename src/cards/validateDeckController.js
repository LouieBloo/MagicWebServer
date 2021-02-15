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
    let targetLine = splitDeck[x];
    if (!targetLine) {
      continue;
    }

    targetLine = targetLine.trim();

    let amount = targetLine.split(/ (.+)/)[0] || "";
    amount = amount.replace(/\D/g, '');
    if (!amount) {
      errors.push("No amount for: " + targetLine)
      continue;
    }

    let cardName = targetLine.split(/ (.+)/)[1];
    if (!cardName) {
      errors.push("No name for: " + targetLine)
      continue;
    }
    // console.log(amount + ": " + cardName);

    let foundCard = await CardModel.findOne({ name: cardName });
    //let foundCard = await CardModel.findOne({ $text: { $search: cardName } });

    if (!foundCard) {
      foundCard = await CardModel.findOne({ $text: { $search: "\"" + cardName + "\"" } });
      if (!foundCard) {
        errors.push("Couldnt find: " + targetLine)
        continue;
      }
    }

    deck.push({ card: foundCard, amount: amount })

  }

  return { status: 200, response: { errors: errors, deck: deck } }
}
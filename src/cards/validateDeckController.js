const mongoose = require('mongoose');
const CardModel = mongoose.model('cards');
const { check } = require('express-validator');

module.exports.validation = [
  check('deck').isString().withMessage("Invalid Deck"),
  check('commander').isString().withMessage("Invalid Commander").optional()
];
module.exports.handler = async (req, res, next) => {
  let mainDeck = await parseLines(req.validParams.deck);
  let errors = [];
  errors = errors.concat(mainDeck.errors);

  return { status: 200, response: { errors: errors, deck: mainDeck.deck, commander: mainDeck.commanders ? mainDeck.commanders : null } }
}


const parseLines = async (lines) => {
  let splitDeck = lines.split(/\r?\n/);
  let deck = [];
  let commanders = [];
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
    let isACommander = false;
    if (!cardName) {
      //errors.push("No name for: " + targetLine)
      continue;
    } else if (cardName.endsWith('*')) {
      isACommander = true;
      cardName = cardName.substring(0, cardName.length - 1);
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


    if (isACommander) {
      commanders.push({ card: foundCard, amount: amount })
    } else {
      deck.push({ card: foundCard, amount: amount })
    }
  }

  return ({ deck: deck, commanders: commanders, errors: errors });
}
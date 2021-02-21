
// var mongoose = require('mongoose');
// const cardSchema = require('../models/Card');
// var CardModel = mongoose.model('cards');


// const rawCardJSON = require('../../default-cards-20210208220255.json');

// const findCardByName = (name) =>{
//     for(let x = 0;x < rawCardJSON.length;x++){
//         if(rawCardJSON[x].name.toUpperCase() == name.toUpperCase()){
//             return rawCardJSON[x];
//         }
//     }
//     return null;
// }

// const downloadAll = async()=>{
//     let database = require('../database/main-database');
//     await database.connect();

//     //let target = findCardByName("Huntmaster of the Fells // Ravager of the Fells");
//     for(let x = 0; x < rawCardJSON.length; x++){
//         console.log(x);
//         await uploadCard(rawCardJSON[x]);
//     }
//     console.log("DONE!")
// }

// const uploadCard = async(card)=>{
//     let newCard = new CardModel();
//     newCard.name = card.name;
//     newCard.id = card.id;
//     newCard.card_faces = card.card_faces;
//     newCard.mana_cost = card.mana_cost;
//     newCard.type_line = card.type_line;
//     newCard.image_uris = card.image_uris;

//     let result = await newCard.save().catch(error=>{
//         console.log("error saving card: ",error)
//     })
// }

// downloadAll();

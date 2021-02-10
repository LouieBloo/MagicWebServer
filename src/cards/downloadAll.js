const Scry = require("scryfall-sdk");


// Scry.Cards.search("").on("data", card => {
// 	console.log(card.name);
// }).on("end", () => {
// 	console.log("done");
// });


let finalJson = [];
var fs = require('fs');

const go = async () => {
    let total = 0;
    let allSets = await Scry.Sets.all();
    console.log(allSets.length)

    for (let x = 0; x < 10; x++) {
        for(let cardNumber = 1;cardNumber <= allSets[x].card_count;cardNumber++){
            
            let card = await Scry.Cards.bySet(allSets[x].code, cardNumber)
            console.log("card downloaded...")
            finalJson.push(card);
        }
    }

    fs.writeFile('allCards.json', finalJson, 'utf8', ()=>{

    });
    console.log("done...")
    console.log(finalJson.length)
}

//go();

let test = require('../../default-cards-20210208220255.json')
console.log(test.length)
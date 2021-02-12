import { Card } from "../rooms/schema/CardSchema";

const allCards = require('../../default-cards-20210208220255.json')

const loadedCards:Card[] = [];

// export const AllCards = allCards;

export const GetRealSchemaCard = (id:string):Card=>{
    for(let x = 0;x<loadedCards.length;x++){
        if(loadedCards[x].id == id){
            return loadedCards[x];
        }
    }
    return null;
}

export const CreateCard = (sessionId: string, id: string): Card => {
    if (id) {
        return null;
    } else {
        let newCard:Card = new Card(sessionId);
        newCard.setFromDisc(allCards[Math.round(Math.random() * allCards.length)]);
        loadedCards.push(newCard);
        return newCard;
    }
}
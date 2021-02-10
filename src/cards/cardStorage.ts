import { Card } from "../rooms/schema/CardSchema";

const allCards = require('../../default-cards-20210208220255.json')

export const AllCards = allCards;


export const CreateCard = (sessionId: string, id: string): Card => {
    if (id) {
        return null;
    } else {
        let newCard:Card = new Card(sessionId);
        newCard.setFromDisc(allCards[Math.round(Math.random() * allCards.length)]);
        return newCard;
    }
}
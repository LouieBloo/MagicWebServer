import { Card } from "../rooms/schema/CardSchema";

const allCards = require('../../default-cards-20210208220255.json')


export class CardStorage {
    loadedCards: Card[] = [];

    GetRealSchemaCard = (id: string): Card => {
        for (let x = 0; x < this.loadedCards.length; x++) {
            if (this.loadedCards[x].id == id) {
                return this.loadedCards[x];
            }
        }
        return null;
    }

    CreateCard = (sessionId: string, id: string): Card => {
        if (id) {
            return null;
        } else {
            let newCard: Card = new Card(sessionId);
            newCard.setFromDisc(allCards[Math.round(Math.random() * allCards.length)]);
            this.loadedCards.push(newCard);
            return newCard;
        }
    }

}
import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Card, CardLocation } from "./CardSchema";



export class Deck extends Schema {

    @type([Card])
    cards = new ArraySchema<Card>();

    constructor() {
        super();
    }

    //we dont want top modify our cards array because the act of moving a card somwhere
    //will do it for us
    drawCardsNoModify(amount: number): Card[] {
        let returnCards: Card[] = [];
        for (let x = 0; x < amount; x++) {
            if (this.cards.length > 0) {
                returnCards.push(this.cards[this.cards.length - 1]);
            }

        }
        return returnCards;
    }

    addCard(card: Card, top: boolean = true) {
        card.location = CardLocation.Deck;
        card.rotation = 0;
        if (top) {
            this.cards.push(card);
        } else {
            this.cards.unshift(card);
        }
    }

    removeCard(card: Card) {
        let foundObject = this.cards.find(obj => {
            return obj.id == card.id;
        })
        if (foundObject) {
            let index = this.cards.indexOf(foundObject);
            this.cards.splice(index, 1);
        }
    }

    findCardById(id: string): Card {
        let foundObject = this.cards.find(obj => {
            return obj.id == id;
        })
        if (foundObject) {
            return foundObject;
        }
        return null;
    }
}
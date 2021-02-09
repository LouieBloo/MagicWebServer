import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Card, CardLocation } from "./CardSchema";



export class Graveyard extends Schema {

    @type([ Card ])
    cards = new ArraySchema<Card>();

    constructor() {
        super();
    }

    addCard(card:Card){
        let newCard:Card = new Card(card.owner);
        newCard.set(card);
        newCard.location = CardLocation.Graveyard;
        this.cards.push(newCard);
    }

    removeCard(card:Card){
        let foundObject = this.cards.find(obj=>{
            return obj.id == card.id;
        })
        if(foundObject){
            let index = this.cards.indexOf(foundObject);
            this.cards.splice(index,1);
        }
    }
}
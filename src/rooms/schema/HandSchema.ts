import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Player } from './PlayerSchema';
import { Card, CardLocation } from './CardSchema';
import {AllCards} from '../../cards/cardStorage'

export class Hand extends Schema {

    @type("string")
    name:string;

    @type([ Card ])
    cards = new ArraySchema<Card>();

    constructor() {
        super();
    }

    addCard(card:Card){
        let newCard:Card = new Card(card.owner);
        newCard.set(card);
        newCard.location = CardLocation.Hand;
        this.cards.push(newCard);
    }

    addMultipleCards(cards:Card[]){
        this.cards = this.cards.concat(cards);
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
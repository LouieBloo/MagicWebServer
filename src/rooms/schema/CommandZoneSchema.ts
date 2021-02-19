import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Card, CardLocation } from "./CardSchema";



export class CommandZone extends Schema {

    @type([ Card ])
    cards = new ArraySchema<Card>();

    constructor() {
        super();
    }

    addCard(card:Card){
        card.location = CardLocation.CommandZone;
        card.rotation = 0;
        this.cards.push(card);
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

    findCardById(id:string):Card{
        let foundObject = this.cards.find(obj=>{
            return obj.id == id;
        })
        if(foundObject){
            return foundObject;
        }
        return null;
    }
}
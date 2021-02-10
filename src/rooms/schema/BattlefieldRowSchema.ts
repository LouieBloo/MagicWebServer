import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Card, CardLocation } from "./CardSchema";


export enum BattlefieldRowType {
    Creature="Creature",
    Noncreature="Noncreature",
    Land="Land"
}

export class BattlefieldRow extends Schema {
  

    @type("string")
    type:BattlefieldRowType;

    @type([ Card ])
    cards = new ArraySchema<Card>();

    constructor(battlefieldRowType:BattlefieldRowType) {
        super();
        this.type = battlefieldRowType;
    }

    addCard(card:Card){
        let newCard:Card = new Card(card.owner);
        newCard.set(card);
        newCard.location = CardLocation.Battlefield;
        this.cards.push(newCard);
    }

    removeCard(card:Card):boolean{
        let foundObject = this.cards.find(obj=>{
            return obj.id == card.id;
        })
        if(foundObject){
            let index = this.cards.indexOf(foundObject);
            this.cards.splice(index,1);
            return true;
        }
        return false;
    }

    rotateCard(card:Card){
        let foundObject = this.cards.find(obj=>{
            return obj.id == card.id;
        })
        if(foundObject){
            foundObject.rotation = foundObject.rotation == 90 ? 0 : 90;
        }
    }
}
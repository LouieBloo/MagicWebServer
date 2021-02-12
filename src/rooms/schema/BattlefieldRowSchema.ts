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
        card.location = CardLocation.Battlefield;
        this.cards.push(card);
    }

    removeCard(card:Card):BattlefieldRowType{
        let foundObject = this.cards.find(obj=>{
            return obj.id == card.id;
        })
        if(foundObject){
            let index = this.cards.indexOf(foundObject);
            this.cards.splice(index,1);
            return this.type;
        }
        return null;
    }

    findCard(card:Card):Card{
        return this.findCardById(card.id);
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

    rotateCard(card:Card){
        let foundObject = this.cards.find(obj=>{
            return obj.id == card.id;
        })
        if(foundObject){
            foundObject.rotation = foundObject.rotation == 90 ? 0 : 90;
        }
    }
}
import { Schema, MapSchema, type } from "@colyseus/schema";
import { Hand } from './HandSchema';
import { Card, CardLocation } from "./CardSchema";
import { Battlefield } from "./BattlefieldSchema";

import { CreateCard } from '../../cards/cardStorage'

export class Player extends Schema {
    @type("string")
    name: string;
    @type("string")
    sessionId: string;

    @type(Hand)
    hand: Hand = new Hand();

    @type(Battlefield)
    battlefield: Battlefield = new Battlefield();

    constructor(sessionId: string, name: string) {
        super();
        this.name = name;
        this.sessionId = sessionId;
    }

    cardDraw(message: any) {
        this.hand.addCard(CreateCard(this.sessionId, null));
    }

    findCard(card: Card): Card {
        return this.findCardById(card.id);
    }

    findCardById(id:string):Card{
        let foundCard = this.hand.findCardById(id);
        if(foundCard){
            return foundCard;
        }
        return this.battlefield.findCardById(id);
    }

   
}
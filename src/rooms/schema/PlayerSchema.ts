import { Schema, MapSchema, type } from "@colyseus/schema";
import { Hand } from './HandSchema';
import { Card } from "./CardSchema";

export class Player extends Schema {
    @type("string")
    name: string;
    @type("string")
    sessionId: string;

    @type(Hand)
    hand: Hand = new Hand();

    constructor(sessionId: string, name: string) {
        super();
        this.name = name;
        this.sessionId = sessionId;
    }

    cardDraw(message:any){
        this.hand.addCard(new Card());
    }
}
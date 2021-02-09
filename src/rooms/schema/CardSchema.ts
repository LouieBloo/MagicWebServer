import { Schema, MapSchema, type } from "@colyseus/schema";
const { v4: uuidv4 } = require('uuid');

export enum CardLocation {
    Hand="Hand",
    Battlefield="Battlefield",
    Graveyard="Graveyard",
    Exile="Exile",
    Stack="Stack"
}

export class Card extends Schema {
    @type("string")
    id: string = uuidv4();
    @type("number")
    rotation: number = 0;
    @type("string")
    location:CardLocation;
    @type("string")
    owner: string;
    @type("string")
    name: string = "Blacker Lotus";

    constructor(owner:string) {
        super();
    }

    //basically a copy
    set(card:any){
        this.id = card.id;
        this.rotation = card.rotation;
        this.location = card.location;
        this.name = card.name;
        this.owner = card.owner;
    }
}
import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
const { v4: uuidv4 } = require('uuid');

export enum CounterTypes {
    OneOne = "OneOne",
    Poison = "Poison",
    Health = "Health",
    CommanderDamage = "CommanderDamage",
    General = "General"
}

export class Counter extends Schema {
    @type("string")
    type: CounterTypes;
    @type('number')
    amount:number = 0;

    constructor(type: CounterTypes,amount:number) {
        super();
        this.type = type;
        this.amount = amount;
    }

    modifyAmount(amountToModify:number){
        this.amount += amountToModify;
    }
}
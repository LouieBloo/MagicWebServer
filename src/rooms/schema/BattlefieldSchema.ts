import { Schema, MapSchema, type } from "@colyseus/schema";
import { BattlefieldRow, BattlefieldRowType } from './BattlefieldRowSchema';
import { Graveyard } from "./GraveyardSchema";
import { Exile } from "./ExileSchema";
import { Card, CardLocation } from "./CardSchema";


export class Battlefield extends Schema {

    @type({ map: BattlefieldRow })
    battlefieldRows = new MapSchema<BattlefieldRow>();

    @type(Graveyard)
    graveyard: Graveyard = new Graveyard();
    @type(Exile)
    exile: Exile = new Exile();

    constructor() {
        super();
        this.battlefieldRows.set(BattlefieldRowType.Creature, new BattlefieldRow(BattlefieldRowType.Creature))
        this.battlefieldRows.set(BattlefieldRowType.Land, new BattlefieldRow(BattlefieldRowType.Land))
        this.battlefieldRows.set(BattlefieldRowType.Noncreature, new BattlefieldRow(BattlefieldRowType.Noncreature))
    }

    addCard(card:Card,battlefieldRowType:BattlefieldRowType){
        //type changed in row
        this.battlefieldRows.get(battlefieldRowType).addCard(card);
    }

    removeCardFromBattlefield(card: Card) {
        this.battlefieldRows.forEach(element => {
            element.removeCard(card);
        });
    }
}
import { Schema, MapSchema, type } from "@colyseus/schema";
import { BattlefieldRow, BattlefieldRowType } from './BattlefieldRowSchema';
import { Graveyard } from "./GraveyardSchema";
import { Exile } from "./ExileSchema";
import { Card, CardLocation } from "./CardSchema";
import { CommandZone } from "./CommandZoneSchema";


export class Battlefield extends Schema {

    @type({ map: BattlefieldRow })
    battlefieldRows = new MapSchema<BattlefieldRow>();

    @type(Graveyard)
    graveyard: Graveyard = new Graveyard();
    @type(Exile)
    exile: Exile = new Exile();
    @type(CommandZone)
    commandZone: CommandZone = new CommandZone();

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

    removeCardFromBattlefield(card: Card):BattlefieldRowType {
        let foundType:BattlefieldRowType = null;
        this.battlefieldRows.forEach(element => {
            if(!foundType){
                let tempType:BattlefieldRowType = element.removeCard(card);
                if(tempType){
                    foundType = tempType;
                }
            }
        });

        return foundType;
    }

    rotateCard(card:Card){
        this.battlefieldRows.forEach(element => {
            element.rotateCard(card);
        });
    }

    findCard(card:Card):Card{
        return this.findCardById(card.id);
    }

    findCardById(id:string):Card{
        let foundCard = null;
        this.battlefieldRows.forEach(row=>{
            let rowCard = row.findCardById(id);
            if(rowCard){
                foundCard  = rowCard;
            }
        })
        if(!foundCard){
            foundCard = this.graveyard.findCardById(id);
        }
        if(!foundCard){
            foundCard = this.exile.findCardById(id);
        }
        if(!foundCard){
            foundCard = this.commandZone.findCardById(id);
        }
        return foundCard;
    }
}
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from './PlayerSchema';
import { Card, CardLocation } from "./CardSchema";

export class GameState extends Schema {

  @type("string")
  mySynchronizedProperty: string = "Hello world";

  @type({ map: Player })
  players = new MapSchema<Player>();

  createPlayer(sessionId: string, name: string) {
    this.players.set(sessionId, new Player(sessionId, name));
  }

  cardPlayed(message: any){
    this.mySynchronizedProperty = message.name
  }

  cardDraw(sessionId:string,message:any){
    this.players.get(sessionId).cardDraw(message);
  }

  exileCard(sessionId:string,card:Card){
    if(card.location == CardLocation.Hand){
      this.players.get(sessionId).hand.removeCard(card);
    }else{
      console.log("No handler for exiled card: ",card.location);
    }
  }
}
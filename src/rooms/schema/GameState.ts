import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from './PlayerSchema';
import { Card, CardLocation } from "./CardSchema";
import { BattlefieldRowType } from "./BattlefieldRowSchema";

export class GameState extends Schema {

  @type("string")
  mySynchronizedProperty: string = "Hello world";

  @type({ map: Player })
  players = new MapSchema<Player>();

  createPlayer(sessionId: string, name: string) {
    this.players.set(sessionId, new Player(sessionId, name));
  }

  cardPlayed(message: any) {
    this.mySynchronizedProperty = message.name
  }

  cardDraw(sessionId: string, message: any) {
    this.players.get(sessionId).cardDraw(message);
  }

  cardChangeLocation(sessionId: string, card: Card, newLocation:CardLocation,battlefieldRowType:BattlefieldRowType=null){
    if (card.location == CardLocation.Hand) {
      this.players.get(sessionId).hand.removeCard(card);
    } else if (card.location == CardLocation.Battlefield) {
      this.players.get(sessionId).battlefield.removeCardFromBattlefield(card);
    } else if (card.location == CardLocation.Graveyard) {
      this.players.get(sessionId).battlefield.graveyard.removeCard(card);
    } else if (card.location == CardLocation.Exile){
      this.players.get(sessionId).battlefield.exile.removeCard(card);
    }

    if (newLocation == CardLocation.Hand) {
      this.players.get(sessionId).hand.addCard(card);
    } else if (newLocation == CardLocation.Battlefield) {
      this.players.get(sessionId).battlefield.addCard(card,battlefieldRowType);
    } else if (newLocation == CardLocation.Graveyard) {
      this.players.get(sessionId).battlefield.graveyard.addCard(card);
    } else if (newLocation == CardLocation.Exile){
      this.players.get(sessionId).battlefield.exile.addCard(card);
    }
  }

}
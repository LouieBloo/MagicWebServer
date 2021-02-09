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

  cardPlayed(message: any) {
    this.mySynchronizedProperty = message.name
  }

  cardDraw(sessionId: string, message: any) {
    this.players.get(sessionId).cardDraw(message);
  }

  exileCard(sessionId: string, card: Card) {
    if (card.location == CardLocation.Hand) {
      this.players.get(sessionId).hand.removeCard(card);
      this.players.get(sessionId).battlefield.exile.addCard(card);
    } else if (card.location == CardLocation.Battlefield) {
      this.players.get(sessionId).battlefield.removeCardFromBattlefield(card);
      this.players.get(sessionId).battlefield.exile.addCard(card);
    } else if (card.location == CardLocation.Graveyard) {
      this.players.get(sessionId).battlefield.graveyard.removeCard(card);
      this.players.get(sessionId).battlefield.exile.addCard(card);
    } else {
    }
  }

  sendCardToGraveyard(sessionId: string, card: Card) {
    if (card.location == CardLocation.Hand) {
      this.players.get(sessionId).hand.removeCard(card);
      this.players.get(sessionId).battlefield.graveyard.addCard(card);
    } else if (card.location == CardLocation.Battlefield) {
      this.players.get(sessionId).battlefield.removeCardFromBattlefield(card);
      this.players.get(sessionId).battlefield.graveyard.addCard(card);
    } else if (card.location == CardLocation.Exile) {
      this.players.get(sessionId).battlefield.exile.removeCard(card);
      this.players.get(sessionId).battlefield.graveyard.addCard(card);
    } else {
    }
  }

  sendCardToHand(sessionId: string, card: Card) {
    if (card.location == CardLocation.Battlefield) {
      this.players.get(sessionId).battlefield.removeCardFromBattlefield(card);
      this.players.get(sessionId).hand.addCard(card);
    } else if (card.location == CardLocation.Graveyard) {
      this.players.get(sessionId).battlefield.graveyard.removeCard(card);
      this.players.get(sessionId).hand.addCard(card);
    } else if (card.location == CardLocation.Exile) {
      this.players.get(sessionId).battlefield.exile.removeCard(card);
      this.players.get(sessionId).hand.addCard(card);
    } else {
    }
  }

}
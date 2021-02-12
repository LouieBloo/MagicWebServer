import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from './PlayerSchema';
import { Card, CardLocation } from "./CardSchema";
import { BattlefieldRowType } from "./BattlefieldRowSchema";
import { GetRealSchemaCard } from "../../cards/cardStorage";

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

  cardChangeLocation(sessionId: string, inputCard: Card, newLocation: CardLocation, battlefieldRowType: BattlefieldRowType = null, owner: string) {

    let card = GetRealSchemaCard(inputCard.id);

    //when a card is moved if it has attachments we need to track what row type this card was in
    let removedCardType = null;
    if (card.location == CardLocation.Hand) {
      this.players.get(sessionId).hand.removeCard(card);
    } else if (card.location == CardLocation.Battlefield) {
      removedCardType = this.players.get(sessionId).battlefield.removeCardFromBattlefield(card);
    } else if (card.location == CardLocation.Graveyard) {
      this.players.get(sessionId).battlefield.graveyard.removeCard(card);
    } else if (card.location == CardLocation.Exile) {
      this.players.get(sessionId).battlefield.exile.removeCard(card);
    } else if (card.location == CardLocation.AttachedToCard) {
      let attachedToCard: Card = this.players.get(sessionId).findCardById(card.attachedToCardId);
      if (!attachedToCard) { console.error("cant find card by id!");return; }
      attachedToCard.removeAttachedCard(card);
    }

    if (newLocation == CardLocation.Hand) {
      this.players.get(sessionId).hand.addCard(card);
    } else if (newLocation == CardLocation.Battlefield) {
      this.players.get(owner).battlefield.addCard(card, battlefieldRowType);
    } else if (newLocation == CardLocation.Graveyard) {
      this.players.get(sessionId).battlefield.graveyard.addCard(card);
    } else if (newLocation == CardLocation.Exile) {
      this.players.get(sessionId).battlefield.exile.addCard(card);
    }

    //unattach all things from this card if it is leaving the battelfield
    if (card.attachedCards.length > 0 && newLocation != CardLocation.Battlefield) {
      this.unAttachAllCardsFromCard(sessionId, card, removedCardType);
    }
  }

  cardRotated(sessionId: string, card: Card) {
    this.players.get(sessionId).battlefield.rotateCard(GetRealSchemaCard(card.id));
  }

  cardAttached(sessionId: string, targetCard: Card, sourceCard: Card) {

    let foundRealTargetCard = GetRealSchemaCard(targetCard.id);
    let foundRealSourceCard = GetRealSchemaCard(sourceCard.id);
    if (!foundRealTargetCard || !foundRealSourceCard) { return; }

    if (foundRealTargetCard.location != CardLocation.Battlefield) { console.error("ERROR: cant attach card that is not on battlefield"); return; }

    this.cardChangeLocation(sessionId, foundRealSourceCard, CardLocation.AttachedToCard, null, sessionId);
    foundRealTargetCard.attachCard(foundRealSourceCard);
  }

  unAttachAllCardsFromCard(sessionId: string, card: Card, sourceBattlefieldRowType: BattlefieldRowType) {
    card.attachedCards.forEach(attachedCard => {
      this.cardChangeLocation(sessionId, attachedCard, CardLocation.Battlefield, sourceBattlefieldRowType, sessionId);
    })
  }

}
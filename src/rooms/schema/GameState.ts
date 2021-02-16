import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from './PlayerSchema';
import { Card, CardLocation } from "./CardSchema";
import { BattlefieldRowType } from "./BattlefieldRowSchema";
import { CardStorage } from "../../cards/cardStorage";
import { Counter, CounterTypes } from "./CounterSchema";
import { Stack } from "./StackSchema";
import { DeckFromLocation } from "./DeckSchema";

export class GameState extends Schema {

  cardStorage: CardStorage = new CardStorage();

  @type("string")
  mySynchronizedProperty: string = "Hello world";

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type(Stack)
  stack: Stack = new Stack();

  createPlayer(sessionId: string, name: string) {
    this.players.set(sessionId, new Player(sessionId, name, this.cardStorage));
  }

  cardPlayed(message: any) {
    this.mySynchronizedProperty = message.name
  }

  cardDraw(sessionId: string, message: any) {
    let drawnCards: Card[] = this.players.get(sessionId).deck.drawCardsNoModify(message.amount);
    if (drawnCards && drawnCards.length > 0) {
      for (let x = 0; x < drawnCards.length; x++) {
        this.cardChangeLocation(sessionId, drawnCards[x], CardLocation.Hand, null, sessionId);
      }
    }
  }

  cardChangeLocation(sessionId: string, inputCard: Card, newLocation: CardLocation, battlefieldRowType: BattlefieldRowType = null, owner: string,deckFromLocation:DeckFromLocation = null) {

    let card = this.cardStorage.GetRealSchemaCard(inputCard.id);

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
      let attachedToCard: Card = this.cardStorage.GetRealSchemaCard(card.attachedToCardId);
      if (!attachedToCard) { console.error("cant find card by id!"); return; }
      attachedToCard.removeAttachedCard(card);
    } else if (card.location == CardLocation.Stack) {
      this.stack.removeCard(card);
    } else if (card.location == CardLocation.Deck) {
      this.players.get(sessionId).deck.removeCard(card);
    }

    if (newLocation == CardLocation.Hand) {
      this.players.get(sessionId).hand.addCard(card);
    } else if (newLocation == CardLocation.Battlefield) {
      this.players.get(owner).battlefield.addCard(card, battlefieldRowType);
    } else if (newLocation == CardLocation.Graveyard) {
      this.players.get(sessionId).battlefield.graveyard.addCard(card);
    } else if (newLocation == CardLocation.Exile) {
      this.players.get(sessionId).battlefield.exile.addCard(card);
    } else if (newLocation == CardLocation.Stack) {
      this.stack.addCard(card);
    } else if (newLocation == CardLocation.Deck) {
      this.players.get(sessionId).deck.addCard(card,deckFromLocation);
    }

    //unattach all things from this card if it is leaving the battelfield
    if (card.attachedCards.length > 0 && newLocation != CardLocation.Battlefield) {
      this.unAttachAllCardsFromCard(sessionId, card, removedCardType);
    }

    if (newLocation != CardLocation.Battlefield && newLocation != CardLocation.AttachedToCard && newLocation != CardLocation.Stack) {
      card.wipeCounters();
      card.resetFlip();
    }
  }

  cardRotated(sessionId: string, card: Card) {
    this.players.get(sessionId).battlefield.rotateCard(this.cardStorage.GetRealSchemaCard(card.id));
  }

  cardAttached(sessionId: string, targetCard: Card, sourceCard: Card) {

    let foundRealTargetCard = this.cardStorage.GetRealSchemaCard(targetCard.id);
    let foundRealSourceCard = this.cardStorage.GetRealSchemaCard(sourceCard.id);
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

  createOrModifyCounterOnCard(sessionId: string, targetCard: Card, counterType: CounterTypes, amount: number) {
    let card = this.cardStorage.GetRealSchemaCard(targetCard.id);
    card.modifyOrCreateCounter(counterType, amount)
  }

  flipCard(sessionId: string, card: Card) {
    this.cardStorage.GetRealSchemaCard(card.id).flip();
  }

  importDeck(sessionId: string, deck: any){
    this.players.get(sessionId).importDeck(deck);
  }
}
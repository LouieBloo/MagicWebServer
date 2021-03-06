import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from './PlayerSchema';
import { Card, CardLocation } from "./CardSchema";
import { BattlefieldRowType, BattlefieldRow } from "./BattlefieldRowSchema";
import { CardStorage } from "../../cards/cardStorage";
import { Counter, CounterTypes } from "./CounterSchema";
import { Stack } from "./StackSchema";
import { DeckFromLocation } from "./DeckSchema";
import { Room } from "colyseus.js";
import { handleChatMessage, generateServerMessage } from "../../chat/chat-handler";

export class GameState extends Schema {

  // cardStorage: CardStorage = new CardStorage();


  constructor(room: any) {
    super();
    this.room = room;
  }

  room: Room;

  @type("string")
  mySynchronizedProperty: string = "Hello world";

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type(Stack)
  stack: Stack = new Stack();



  playerIdsInTurnOrder: string[] = [];
  indexOfPlayersTurn = 0;

  canAddMorePlayers(maxPlayerSize:number):boolean{
    return this.players.size < maxPlayerSize;
  }

  createPlayer(sessionId: string, name: string) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
    let allSessionIds: string[] = [];
    this.players.forEach(player => {
      player.addNewCommanderDamageCounter(sessionId);
      allSessionIds.push(player.sessionId);
    })

    this.players.set(sessionId, new Player(sessionId,name ));
    allSessionIds.forEach(oldPlayerId => {
      this.players.get(sessionId).addNewCommanderDamageCounter(oldPlayerId);
    })

    this.playerIdsInTurnOrder.push(sessionId);

    if (this.players.size == 1) {
      this.players.get(sessionId).isCurrentTurn = true;
    }

    generateServerMessage(name + " entered the game", this.room)
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

    if (!drawnCards || drawnCards.length < 1) { return; }

    generateServerMessage(this.players.get(sessionId).name + " drew " + drawnCards.length + " card", this.room)
  }

  cardChangeLocation = async (sessionId: string, inputCard: Card, newLocation: CardLocation, battlefieldRowType: BattlefieldRowType = null, owner: string, deckFromLocation: DeckFromLocation = null) => {

    let card = null;
    if (inputCard.location == CardLocation.Inserting) {
      card = await this.players.get(sessionId).cardStorage.CreateCard(sessionId, inputCard.disc_id);
    } else {
      card = this.players.get(sessionId).cardStorage.GetRealSchemaCard(inputCard.id);
      if(!card && inputCard.location == CardLocation.Stack){
        card = inputCard;
        newLocation = CardLocation.Trash;
      }
    }

    let playerWithCardAfterMove = owner || sessionId;
    let playerWithCardBeforeMove = sessionId;
    if (inputCard.location != CardLocation.Inserting && (playerWithCardAfterMove != playerWithCardBeforeMove || inputCard.owner != sessionId)) {
      //moving someone elses card to me
      playerWithCardBeforeMove = inputCard.owner;
      //find it in the player who owns it nows storage
      card = this.players.get(playerWithCardBeforeMove).cardStorage.GetRealSchemaCard(inputCard.id);
      //remove from their storage
      this.players.get(playerWithCardBeforeMove).cardStorage.deleteCard(card)
      //add to our storage
      this.players.get(playerWithCardAfterMove).cardStorage.addCard(card);
      //change card owner
      card.owner = playerWithCardAfterMove;
    }

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
    } else if (card.location == CardLocation.CommandZone) {
      this.players.get(sessionId).battlefield.commandZone.removeCard(card);
    } else if (card.location == CardLocation.AttachedToCard) {
      let attachedToCard: Card = this.players.get(sessionId).cardStorage.GetRealSchemaCard(card.attachedToCardId);
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
      this.players.get(playerWithCardAfterMove).battlefield.addCard(card, battlefieldRowType);
    } else if (newLocation == CardLocation.Graveyard) {
      this.players.get(sessionId).battlefield.graveyard.addCard(card);
    } else if (newLocation == CardLocation.Exile) {
      this.players.get(sessionId).battlefield.exile.addCard(card);
    } else if (newLocation == CardLocation.CommandZone) {
      this.players.get(sessionId).battlefield.commandZone.addCard(card);
    } else if (newLocation == CardLocation.Stack) {
      this.stack.addCard(card);
    } else if (newLocation == CardLocation.Deck) {
      this.players.get(sessionId).deck.addCard(card, deckFromLocation);
    }

    //unattach all things from this card if it is leaving the battelfield
    if (card.attachedCards.length > 0 && newLocation != CardLocation.Battlefield || playerWithCardAfterMove != playerWithCardBeforeMove) {
      this.unAttachAllCardsFromCard(playerWithCardBeforeMove, card, removedCardType);
    }

    if (newLocation != CardLocation.Battlefield && newLocation != CardLocation.AttachedToCard && newLocation != CardLocation.Stack && card.wipeCounters) {
      card.wipeCounters();
      card.resetFlip();
    }

    if (newLocation == CardLocation.Trash) {
      this.players.get(playerWithCardBeforeMove).cardStorage.deleteCard(inputCard);
    }
  }

  cardRotated(sessionId: string, card: Card) {
    this.players.get(sessionId).battlefield.rotateCard(this.players.get(sessionId).cardStorage.GetRealSchemaCard(card.id));
  }

  cardAttached(sessionId: string, targetCard: Card, sourceCard: Card) {

    let foundRealTargetCard = this.players.get(sessionId).cardStorage.GetRealSchemaCard(targetCard.id);
    let foundRealSourceCard = this.players.get(sessionId).cardStorage.GetRealSchemaCard(sourceCard.id);
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

  cardCopied(sessionId: string, card: Card) {
    this.players.get(sessionId).cardCopied(card);
  }

  createOrModifyCounterOnCard(sessionId: string, targetCard: Card, counterType: CounterTypes, amount: number) {
    let card = this.players.get(sessionId).cardStorage.GetRealSchemaCard(targetCard.id);
    card.modifyOrCreateCounter(counterType, amount)
  }

  flipCard(sessionId: string, card: Card) {
    this.players.get(sessionId).cardStorage.GetRealSchemaCard(card.id).flip();
  }

  importDeck(sessionId: string, deck: any) {
    this.players.get(sessionId).importDeck(deck);
  }

  shuffleDeck(sessionId: string) {
    this.players.get(sessionId).shuffleDeck();

    generateServerMessage(this.players.get(sessionId).name + " shuffled", this.room)
  }

  startTurn(sessionId: string){
    this.untapAll(sessionId);
    generateServerMessage(this.players.get(sessionId).name + " started their turn", this.room)
    this.cardDraw(sessionId,{amount:1})
    this.playerClaimedTurn(sessionId);
  }

  untapAll(sessionId: string) {
    this.players.get(sessionId).untapAll();
  }

  modifyPlayerCounter(sessionId: string, counterType: CounterTypes, amount: number, playerId: string = null) {
    this.players.get(sessionId).modifyCounter(counterType, amount, playerId)
  }

  mulligan(sessionId: string) {
    this.players.get(sessionId).mulligan(this);

    generateServerMessage(this.players.get(sessionId).name + " mulliganed", this.room)
  }


  handleChatMessage(client: any, message: any) {
    handleChatMessage(client, message, this.room, this.players);
  }

  playerEndedTurn(sessionId:string){
    if(this.playerIdsInTurnOrder[this.indexOfPlayersTurn] == sessionId){
      this.players.get(sessionId).isCurrentTurn = false;
      this.incrementPlayerTurnIndex();
      this.players.get(this.playerIdsInTurnOrder[this.indexOfPlayersTurn]).isCurrentTurn = true;
      generateServerMessage(this.players.get(sessionId).name + " ended their turn", this.room)
    }
  }

  playerClaimedTurn(sessionId:string){
    if(this.playerIdsInTurnOrder[this.indexOfPlayersTurn] != sessionId){
      this.players.get(this.playerIdsInTurnOrder[this.indexOfPlayersTurn]).isCurrentTurn = false;
      let index = this.playerIdsInTurnOrder.findIndex(id=> id==sessionId);
      this.indexOfPlayersTurn = index;
      this.players.get(sessionId).isCurrentTurn = true;
    }
  }

  incrementPlayerTurnIndex(){
    this.indexOfPlayersTurn++;
    if(this.indexOfPlayersTurn >= this.playerIdsInTurnOrder.length){
      this.indexOfPlayersTurn = 0;
    }
  }

}
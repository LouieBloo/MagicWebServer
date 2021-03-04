import { Schema, MapSchema, type } from "@colyseus/schema";
import { Hand } from './HandSchema';
import { Card, CardLocation } from "./CardSchema";
import { Battlefield } from "./BattlefieldSchema";

import { CardStorage } from '../../cards/cardStorage'
import { Deck } from "./DeckSchema";
import { threadId } from "worker_threads";
import { Counter, CounterTypes } from "./CounterSchema";
import { GameState } from "./GameState";

export class Player extends Schema {

    cardStorage: CardStorage = new CardStorage();

    @type("string")
    name: string;
    @type("string")
    sessionId: string;

    @type(Deck)
    deck: Deck;

    @type(Hand)
    hand: Hand = new Hand();

    @type(Battlefield)
    battlefield: Battlefield = new Battlefield();

    @type(Counter)
    health: Counter = new Counter(CounterTypes.Health, 40);
    @type(Counter)
    poison: Counter = new Counter(CounterTypes.Poison, 0);
    @type({ map: Counter })
    commanderDamages = new MapSchema<Counter>();

    @type("boolean")
    isCurrentTurn:boolean = false;

    savedImportDeck:any;

    constructor(sessionId: string, name: string) {
        super();
        this.name = name;
        this.sessionId = sessionId;
        this.deck = new Deck(this.cardStorage)

        this.addNothing();
    }

    addNothing = async () => {
        let card = await this.cardStorage.CreateCard(this.sessionId, null);
        this.deck.addCard(card, { amount: 1, fromTop: false })
        card = await this.cardStorage.CreateCard(this.sessionId, null);
        this.deck.addCard(card, { amount: 1, fromTop: false })
        card = await this.cardStorage.CreateCard(this.sessionId, null);
        this.deck.addCard(card, { amount: 1, fromTop: false })
        card = await this.cardStorage.CreateCard(this.sessionId, null);
        this.deck.addCard(card, { amount: 1, fromTop: false })
        card = await this.cardStorage.CreateCard(this.sessionId, null);
        this.deck.addCard(card, { amount: 1, fromTop: false })
    }


    findCard(card: Card): Card {
        return this.findCardById(card.id);
    }

    findCardById(id: string): Card {
        let foundCard = this.hand.findCardById(id);
        if (foundCard) {
            return foundCard;
        }
        foundCard = this.deck.findCardById(id);
        if (foundCard) {
            return foundCard;
        }
        return this.battlefield.findCardById(id);
    }

    cardCopied = async(card:Card)=>{
        let newCard = await this.cardStorage.CreateCard(this.sessionId,card.disc_id);
        this.battlefield.cardCopied(card,newCard);
    }

    importDeck(deck: any,mulligan:boolean = false,gameState:GameState = null) {
        this.savedImportDeck = deck;
        this.cardStorage.wipe();
        this.deck = new Deck(this.cardStorage);
        this.hand = new Hand();
        this.battlefield = new Battlefield();

        this.deck.import(this.sessionId, deck.deck,mulligan,gameState);
        this.importCommander(deck.commander)
    }

    importCommander = async (commanderObject: any) => {
        if(!commanderObject){return;}
        for (let x = 0; x < commanderObject.length; x++) {
            for (let y = 0; y < commanderObject[x].amount; y++) {
                let card = await this.cardStorage.CreateCard(this.sessionId, commanderObject[x].card.id);
                this.battlefield.commandZone.addCard(card);
            }
        }
    }

    shuffleDeck() {
        this.deck.shuffle();
    }

    untapAll(){
        this.battlefield.untapAll();
    }

    mulligan(gameState:GameState){
        if(!this.savedImportDeck){return;}
        this.importDeck(this.savedImportDeck,true,gameState);
    }

    modifyCounter(counterType: CounterTypes, amount: number, playerId: string = null) {
        switch (counterType) {
            case CounterTypes.Health:
                return this.health.modifyAmount(amount);
            case CounterTypes.Poison:
                return this.poison.modifyAmount(amount);
            case CounterTypes.CommanderDamage:
                return this.commanderDamages.get(playerId).modifyAmount(amount);
        }
    }

    addNewCommanderDamageCounter(playerId: string) {
        let counter: Counter = new Counter(CounterTypes.CommanderDamage, 0);
        this.commanderDamages.set(playerId,counter);
    }
}

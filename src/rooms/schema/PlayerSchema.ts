import { Schema, MapSchema, type } from "@colyseus/schema";
import { Hand } from './HandSchema';
import { Card, CardLocation } from "./CardSchema";
import { Battlefield } from "./BattlefieldSchema";

import { CardStorage } from '../../cards/cardStorage'
import { Deck } from "./DeckSchema";

export class Player extends Schema {

    cardStorage: CardStorage;

    @type("string")
    name: string;
    @type("string")
    sessionId: string;

    @type(Deck)
    deck: Deck = new Deck();

    @type(Hand)
    hand: Hand = new Hand();

    @type(Battlefield)
    battlefield: Battlefield = new Battlefield();

    constructor(sessionId: string, name: string, cardStorage: CardStorage) {
        super();
        this.name = name;
        this.sessionId = sessionId;
        this.cardStorage = cardStorage;

        this.deck.addCard(this.cardStorage.CreateCard(sessionId,null))
        this.deck.addCard(this.cardStorage.CreateCard(sessionId,null))
        this.deck.addCard(this.cardStorage.CreateCard(sessionId,null))
        this.deck.addCard(this.cardStorage.CreateCard(sessionId,null))
        this.deck.addCard(this.cardStorage.CreateCard(sessionId,null))
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


}

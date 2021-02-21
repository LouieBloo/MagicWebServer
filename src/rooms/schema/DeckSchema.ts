import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Card, CardLocation } from "./CardSchema";
import { CardStorage } from "../../cards/cardStorage";
import { GameState } from "./GameState";

export interface DeckFromLocation {
    amount: number;
    fromTop: boolean;
}

export class Deck extends Schema {

    @type([Card])
    cards: Card[] = [];

    cardStorage: CardStorage;

    constructor(cardStorage: CardStorage) {
        super();
        this.cardStorage = cardStorage;
    }

    //we dont want top modify our cards array because the act of moving a card somwhere
    //will do it for us
    drawCardsNoModify(amount: number): Card[] {
        let returnCards: Card[] = [];
        for (let x = 0; x < amount && x < this.cards.length; x++) {
            returnCards.push(this.cards[x]);
        }
        return returnCards;
    }

    addCard(card: Card, deckFromLocation: DeckFromLocation) {
        card.location = CardLocation.Deck;
        card.rotation = 0;
        if ((!deckFromLocation.fromTop && deckFromLocation.amount == 1) || this.cards.length < 1) {
            this.cards.push(card);
        } else {
            this.insertCardAtPosition(card,deckFromLocation);
        }
    }

    insertCardAtPosition(card: Card, deckFromLocation: DeckFromLocation) {
        let newDeck: Card[] = [];
        if(deckFromLocation.fromTop){
            for(let x = 0; x<this.cards.length;x++){
                if(x == (deckFromLocation.amount-1)){
                    newDeck.push(card);
                }
                newDeck.push(this.cards[x]);
            }
        }else{
            for(let x = 0; x<this.cards.length;x++){
                newDeck.push(this.cards[x]);
                if(x == (this.cards.length - deckFromLocation.amount)){
                    newDeck.push(card);
                }
            }
        }
        this.cards = newDeck;
    }

    removeCard(card: Card) {
        let foundObject = this.cards.find(obj => {
            return obj.id == card.id;
        })
        if (foundObject) {
            let index = this.cards.indexOf(foundObject);
            this.cards.splice(index, 1);
        }
    }

    findCardById(id: string): Card {
        let foundObject = this.cards.find(obj => {
            return obj.id == id;
        })
        if (foundObject) {
            return foundObject;
        }
        return null;
    }

    import = async (sessionId: string, deck: any,mulligan:boolean,gameState:GameState) => {
        //let allCards: ArraySchema<Card> = new ArraySchema<Card>();
        for (let x = 0; x < deck.length; x++) {
            for (let y = 0; y < deck[x].amount; y++) {
                let card = await this.cardStorage.CreateCard(sessionId, deck[x].card.id);
                // card.location = CardLocation.Deck;
                // card.rotation = 0;
                //allCards.push(card);
                this.addCard(card, { amount: 1, fromTop: false });
            }
        }
        this.shuffle();
        if(mulligan){
            gameState.cardDraw(sessionId,{amount:7})
        }
    }

    shuffle(){
        this.shuffleReal(this.cards)
    }

    shuffleReal(array:Card[]) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
      }
}
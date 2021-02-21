import { Card } from "../rooms/schema/CardSchema";

// const allCards = require('../../default-cards-20210208220255.json')

const mongoose = require('mongoose');
const CardModel = mongoose.model('cards');

export class CardStorage {
    loadedCards: Card[] = [];

    GetRealSchemaCard = (id: string): Card => {
        for (let x = 0; x < this.loadedCards.length; x++) {
            if (this.loadedCards[x].id == id) {
                return this.loadedCards[x];
            }
        }
        return null;
    }

    CreateCard = async(sessionId: string, id: string): Promise<Card> => {
        if (id) {
            return await this.createCardFromId(sessionId, id);
        } else {
            return await this.CreateRandomCard(sessionId);
        }
    }

    deleteCard = (card:Card)=>{
        let index = null;
        for (let x = 0; x < this.loadedCards.length; x++) {
            if (this.loadedCards[x].id == card.id) {
                index = x;
            }
        }
        if(index){
            this.loadedCards.splice(index, 1);
        }
    }

    addCard = (card:Card)=>{
        this.loadedCards.push(card);
    }

    wipe = ()=>{
        this.loadedCards = [];
    }

    private createCardFromId = async(sessionId: string, id: string): Promise<Card> => {
        let newCard: Card = new Card(sessionId);
        let cardOnDisc = await this.findCardOnDisc(id);
        newCard.setFromDisc(cardOnDisc);
        this.loadedCards.push(newCard);
        return newCard;
    }

    private CreateRandomCard = async(sessionId: string): Promise<Card> => {
        let newCard: Card = new Card(sessionId);
        let cardOnDisc = await this.findRandomCardOnDisc();
        newCard.setFromDisc(cardOnDisc);
        this.loadedCards.push(newCard);
        return newCard;
    }

    private findCardOnDisc = async (id: string) => {
        let foundCard = await CardModel.findOne({ id: id });
        // console.log("found card: ",foundCard);
        return foundCard;
    }

    private findRandomCardOnDisc = async () => {
        let foundCard = await CardModel.aggregate([{ $sample: { size: 1 } }])
        // console.log("found card: ",foundCard);
        return foundCard[0];
    }

}

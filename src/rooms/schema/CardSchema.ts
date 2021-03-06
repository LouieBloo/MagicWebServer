import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { Counter, CounterTypes } from "./CounterSchema";
const { v4: uuidv4 } = require('uuid');

export enum CardLocation {
    Hand = "Hand",
    Battlefield = "Battlefield",
    Graveyard = "Graveyard",
    Exile = "Exile",
    AttachedToCard = "AttachedToCard",
    Stack = "Stack",
    Deck = "Deck",
    CommandZone = "CommandZone",
    Inserting="Inserting",
    Trash="Trash"
}
export class ImageUris extends Schema {
    @type("string")
    small: string;
    @type("string")
    normal: string;
    @type("string")
    large: string;
    @type("string")
    png: string;
}
export class CardFace extends Schema {
    @type("string")
    name: string;
    @type(ImageUris)
    image_uris: ImageUris;
}


export class Card extends Schema {
    @type("string")
    id: string = uuidv4();
    @type("string")
    disc_id: string;
    @type("string")
    type_line: string;
    @type("number")
    rotation: number = 0;
    @type("string")
    location: CardLocation;
    @type("string")
    owner: string;
    @type("string")
    name: string;
    @type(ImageUris)
    image_uris: ImageUris;
    @type([CardFace])
    card_faces = new ArraySchema<CardFace>();
    @type('boolean')
    flipped: boolean = false;


    @type([Card])
    attachedCards = new ArraySchema<Card>();
    @type("string")
    attachedToCardId: string;

    @type(Counter)
    counter: Counter;

    constructor(owner: string) {
        super();
        this.owner = owner;
    }

    // //basically a copy
    // set(card: any) {
    //     this.id = card.id;
    //     this.rotation = card.rotation;
    //     this.location = card.location;
    //     this.name = card.name;
    //     this.owner = card.owner;
    //     this.disc_id = card.disc_id;
    //     this.image_uris = this.mapImageUris(card.image_uris);
    //     this.type_line = card.type_line;
    //     this.attachedCards = card.attachedCards;
    //     this.attachedToCardId = card.attachedToCardId;
    // }

    //when loading the card the first time
    setFromDisc(card: any) {
        this.disc_id = card.id;
        this.name = card.name;
        this.image_uris = this.mapImageUris(card.image_uris);
        this.type_line = card.type_line;

        if (card.card_faces) {
            card.card_faces.forEach((element: any) => {
                this.card_faces.push(this.mapCardFace(element));
            });
        }
    }

    mapImageUris(image_uris: any): ImageUris {
        if (!image_uris) { console.error("No image uris!"); return; }
        let finalObject = new ImageUris();
        finalObject.small = image_uris.small;
        finalObject.normal = image_uris.normal;
        finalObject.large = image_uris.large;
        finalObject.png = image_uris.png;
        return finalObject;
    }

    mapCardFace(cardFace: any): CardFace {
        let finalObject = new CardFace();
        finalObject.name = cardFace.name;
        finalObject.image_uris = this.mapImageUris(cardFace.image_uris);
        return finalObject;
    }

    //asumes card is a real schema not passed in from front end
    attachCard(card: Card) {
        card.location = CardLocation.AttachedToCard;
        card.attachedToCardId = this.id;
        this.attachedCards.push(card);
    }

    removeAttachedCard(card: Card) {
        let foundObject = this.attachedCards.find(obj => {
            return obj.id == card.id;
        })
        if (foundObject) {
            foundObject.attachedToCardId = null;
            let index = this.attachedCards.indexOf(foundObject);
            this.attachedCards.splice(index, 1);
            return true;
        }
    }


    modifyOrCreateCounter(counterType: CounterTypes, amountToModify: number) {
        if (this.counter && this.counter.type == counterType) {
            this.counter.modifyAmount(amountToModify);
        } else {
            this.counter = new Counter(counterType, amountToModify);
        }
    }

    wipeCounters() {
        this.counter = null;
    }

    flip() {
        this.flipped = !this.flipped;
    }

    resetFlip() {
        this.flipped = false;
    }

    // findCardById(id:string):Card{
    //     if(this.id == id){
    //         return this;
    //     }
    //     let foundObject = this.attachedCards.find(obj=>{
    //         return obj.id == id;
    //     })
    //     if(foundObject){
    //         return foundObject;
    //     }
    //     return null;
    // }
}
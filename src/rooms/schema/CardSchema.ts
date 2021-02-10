import { Schema, MapSchema, type } from "@colyseus/schema";
const { v4: uuidv4 } = require('uuid');

export enum CardLocation {
    Hand="Hand",
    Battlefield="Battlefield",
    Graveyard="Graveyard",
    Exile="Exile",
    Stack="Stack"
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
    location:CardLocation;
    @type("string")
    owner: string;
    @type("string")
    name: string;
    @type(ImageUris)
    image_uris:ImageUris;

    constructor(owner:string) {
        super();
    }

    //basically a copy
    set(card:any){
        this.id = card.id;
        this.rotation = card.rotation;
        this.location = card.location;
        this.name = card.name;
        this.owner = card.owner;
        this.disc_id = card.disc_id;
        this.image_uris = this.mapImageUris(card.image_uris);
        this.type_line = card.type_line;
    }

    //basically a copy
    setFromDisc(card:any){
        this.disc_id = card.id;
        this.name = card.name;
        this.image_uris = this.mapImageUris(card.image_uris);
        this.type_line = card.type_line;
    }

    mapImageUris(image_uris:any):ImageUris{
        if(!image_uris){console.error("No image uris!");return;}
        let finalObject = new ImageUris();
        finalObject.small = image_uris.small;
        finalObject.normal = image_uris.normal;
        finalObject.large = image_uris.large;
        finalObject.png = image_uris.png;
        return finalObject;
    }
}
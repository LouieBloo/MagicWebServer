import { Room, Client } from "colyseus";
import { GameState } from "./schema/GameState";
import { Player } from './schema/PlayerSchema';

export class MyRoom extends Room {

  // roomId:string;

  maxPlayerCount:number = 8;

  constructor(options:any){
    super(options)
    
    //this.roomId = options.roomId;
  }

  onCreate(options: any) {
    console.log("on create")
    // this.roomId = options.roomId;

    this.setState(new GameState(this));

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });

    this.onMessage("cardPlayed", (client, message) => {
      // console.log("play")
      this.state.cardPlayed(message)
    })

    this.onMessage("cardDraw", (client, message) => {
      // console.log("draw")
      this.state.cardDraw(client.sessionId, message)
      
    })

    this.onMessage("cardChangeLocation", (client, message) => {
      console.log("location: ",message.newLocation)
      this.state.cardChangeLocation(client.sessionId, message.card, message.newLocation,message.battlefieldRowType,message.owner ? message.owner.sessionId : null,message.deckFromLocation);
    })

    this.onMessage("cardRotated", (client, message) => {
      console.log("rotated: ")
      this.state.cardRotated(client.sessionId, message.card);
    })

    this.onMessage("cardAttached", (client, message) => {
      console.log("attaching: ")
      this.state.cardAttached(client.sessionId, message.targetCard,message.sourceCard);
    })

    this.onMessage("cardCopied", (client, message) => {
      this.state.cardCopied(client.sessionId, message.card);
    })

    this.onMessage("createOrModifyCounterOnCard", (client, message) => {
      this.state.createOrModifyCounterOnCard(client.sessionId, message.targetCard,message.counterType,message.amount);
    })

    this.onMessage("modifyPlayerCounter", (client, message) => {
      this.state.modifyPlayerCounter(client.sessionId, message.counterType,message.amount,message.playerId);
    })

    this.onMessage("flipCard", (client, message) => {
      this.state.flipCard(client.sessionId, message.card);
    })

    this.onMessage("importDeck", (client, message) => {
      this.state.importDeck(client.sessionId, message.deck);
    })

    this.onMessage("shuffleDeck", (client, message) => {
      this.state.shuffleDeck(client.sessionId);
    })

    this.onMessage("startTurn", (client, message) => {
      this.state.startTurn(client.sessionId);
    })

    this.onMessage("untapAll", (client, message) => {
      this.state.untapAll(client.sessionId);
    })

    this.onMessage("mulligan", (client, message) => {
      this.state.mulligan(client.sessionId);
    })

    this.onMessage("chat", (client, message) => {
      this.state.handleChatMessage(client,message)
    })

    this.onMessage("endTurn", (client, message) => {
      this.state.playerEndedTurn(client.sessionId)
    })

  }

  onAuth(client:any, options:any, request:any) {
    return this.state.canAddMorePlayers(this.maxPlayerCount);
  }

  onJoin(client: Client, options: any) {
    // console.log("onJoin",client,options)
    console.log("onJoin")
    console.log(options);
    this.state.createPlayer(client.sessionId, options.name)
  }

  onLeave(client: Client, consented: boolean) {
    // console.log("onLeave",client,consented)
    console.log("onLeave")
  }

  onDispose() {
    console.log("onDisplose")
  }

}

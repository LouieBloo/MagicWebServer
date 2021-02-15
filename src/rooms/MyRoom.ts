import { Room, Client } from "colyseus";
import { GameState } from "./schema/GameState";
import { Player } from './schema/PlayerSchema';

export class MyRoom extends Room {

  onCreate(options: any) {
    this.setState(new GameState());

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
      this.state.cardChangeLocation(client.sessionId, message.card, message.newLocation,message.battlefieldRowType,message.owner ? message.owner.sessionId : null);
    })

    this.onMessage("cardRotated", (client, message) => {
      console.log("rotated: ")
      this.state.cardRotated(client.sessionId, message.card);
    })

    this.onMessage("cardAttached", (client, message) => {
      console.log("attaching: ")
      this.state.cardAttached(client.sessionId, message.targetCard,message.sourceCard);
    })

    this.onMessage("createOrModifyCounterOnCard", (client, message) => {
      this.state.createOrModifyCounterOnCard(client.sessionId, message.targetCard,message.counterType,message.amount);
    })

    this.onMessage("flipCard", (client, message) => {
      this.state.flipCard(client.sessionId, message.card);
    })

    this.onMessage("importDeck", (client, message) => {
      this.state.importDeck(client.sessionId, message.deck);
    })

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

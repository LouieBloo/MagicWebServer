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
      this.state.cardChangeLocation(client.sessionId, message.card, message.newLocation,message.battlefieldRowType,message.owner);
    })

    this.onMessage("cardRotated", (client, message) => {
      console.log("rotated: ")
      this.state.cardRotated(client.sessionId, message.card);
    })
    // this.onMessage("sendCardToHand", (client, message) => {
    //   this.state.sendCardToHand(client.sessionId,message.card);
    // })

    // this.onMessage("sendCardToGraveyard", (client, message) => {
    //   this.state.sendCardToGraveyard(client.sessionId,message.card);
    // })


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

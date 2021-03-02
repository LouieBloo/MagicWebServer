import { Player } from "../rooms/schema/PlayerSchema";
import { MapSchema } from "@colyseus/schema";

export const handleChatMessage = (client: any, message: any, room: any, players: MapSchema<Player>) => {
    if (!message || !message.message) { return; }

    let chatMessage: string = message.message.trim();
    let playerThatSentMessage: Player = players.get(client.sessionId);

    let broadcastMessage = "";
    if (chatMessage.includes("/roll ")) {
        let diceSize: string = chatMessage.split("/roll ")[1];
        let randomNumber = getRandomInt(1, parseInt(diceSize));
        broadcastMessage += "rolled a (D" + diceSize + "): " + randomNumber;
    } else {
        broadcastMessage += chatMessage;
    }

    room.broadcast("chat", { playerName: playerThatSentMessage.name, playerId: playerThatSentMessage.sessionId, message: broadcastMessage });
}

export const generateServerMessage = (message: any, room: any) => {
    if (!message) { return; }
    let broadcastMessage = message;
    room.broadcast("chat", { playerName: "Game", playerId: null, message: broadcastMessage });
}

export interface ChatMessage{
    playerName?:string;
    playerId?:string;
    message?:string;
}

const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
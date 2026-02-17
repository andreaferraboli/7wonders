import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import { SevenWondersRoom } from "./rooms/SevenWondersRoom";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());

const server = app.listen(port, () => {
    console.log(`🎮 Colyseus server running on port ${port}`);
});

const gameServer = new Server({
    transport: new WebSocketTransport({ server }),
});

// Define room
gameServer.define("7wonders", SevenWondersRoom);

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("🛑 Shutting down gracefully...");
    gameServer.gracefullyShutdown().then(() => {
        process.exit(0);
    });
});

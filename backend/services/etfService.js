const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();

const httpServer = http.createServer(app);

const server = new socketio.Server(httpServer, {
  cors: {
    origin: "*",
  },
});

server.on("connection", (socket) => {
  console.log("User connected");
});

httpServer.listen(process.env.PORT || 5001, () =>
  console.log("Socket server running")
);

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const history = [];
let teams = {
  alpha: {
    name: "Alliance 1",
    teamName: "alpha",
    health: 292,
    budget: 1000,
    defenses: { "Network Shield": 2 },
    attacks: { "Shadow Intrusion": 4, "Vault Breaker": 3, "Infiltration Web": 3, "Stealth Link":0, "Swarm Overload" : 1, "System Flood": 0 },
  },

  beta: {
    name: "Alliance 2",
    teamName: "beta",
    health: 264,
    budget: 1000,
    defenses: { "Network Shield": 1, "Traffic Guard": 1 },
    attacks: { "Shadow Intrusion": 2, "Vault Breaker": 4, "Infiltration Web": 1, "Stealth Link":3, "Swarm Overload" : 1, "System Flood": 0 },
  },
  gamma: {
    name: "Alliance 3",
    teamName: "gamma",
    health: 303,
    budget: 1000,
    defenses: { "Network Shield": 2 },
    attacks: { "Shadow Intrusion": 1, "Vault Breaker": 1, "Infiltration Web": 0, "Stealth Link":0, "Swarm Overload" : 0, "System Flood": 0  },
  },
  delta: {
    name: "Aditya",
    teamName: "delta",
    health: 100,
    budget: 1000,
    defenses: { "Network Shield": 2 },
    attacks: { "Shadow Intrusion": 0, "Vault Breaker": 3, "Infiltration Web": 3, "Stealth Link":0, "Swarm Overload" : 1, "System Flood": 0 },
  },
  epsilon: {
    name: "Artham",
    teamName: "epsilon",
    health: 100,
    budget: 1000,
    defenses: { "Network Shield": 2 },
    attacks: { "Vault Breaker": 1, "System Flood": 3, "Shadow Intrusion":4,  },
  },
  bond: {
    name: "Sneha",
    teamName: "bond",
    health: 100,
    budget: 1000,
    defenses: { "Network Shield": 2 },
    attacks: { "Vault Breaker": 1, "Swarm Overload":3, "Shadow Intrusion" : 5 },
  },
};
const loggedIn = {};
let gameStarted = false; // To track if the game has started

app.use(express.static("public"));
let count = 1;

io.use((socket, next) => {
  const socketId = socket.handshake.query.socketId;
  if (socketId) {
    socket.id = socketId;
  }
  next();
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id, count++);
  if (loggedIn[socket.id]) {
    console.log("Anmol", socket.id, loggedIn?.[socket.id]?.teamName);
    socket.emit("team-joined", { teamName: loggedIn?.[socket.id]?.teamName });
  }
  socket.on("host-joined", () => {
    console.log("Host has joined");
  });

  socket.on("team-joined", ({ teamName }) => {
    loggedIn[socket.id] = teams[teamName];
    console.log(`${teamName} joined.`);
    io.emit("update-teams", loggedIn); // Fix: Emit the correct teams
  });

  socket.on("start-game", () => {
    gameStarted = true;
    io.emit("game-started"); // Notify all teams
    io.emit("host-message", "Host has started the game. You may now attack.");
  });

  socket.on("host-message", (message) => {
    socket.broadcast.emit("host-message", message);
  });
  const attacks = [
    {
      name: "Shadow Intrusion",
      strength: 6,
    },
    {
      name: "Vault Breaker",
      strength: 10,
    },
    {
      name: "Infiltration Web",
      strength: 12,
    },
    {
      name: "Stealth Link",
      strength: 20,
    },
    {
      name: "Swarm Overload",
      strength: 26,
    },
    {
      name: "System Flood",
      strength: 28,
    },
  ];
  socket.on("attack", ({ targetId, attackType }) => {
    if (
      gameStarted &&
      teams[loggedIn[socket.id].teamName] &&
      teams[loggedIn[targetId].teamName] &&
      teams[loggedIn[socket.id].teamName].attacks[attackType] > 0
    ) {
      history.push({
        currentTeam: teams[loggedIn?.[socket.id]?.teamName],
        targetTeam: teams[loggedIn?.[targetId]?.teamName],
        attackType: attackType,
      });
      // Check if both teams exist and the target is not the same team
      if (targetId !== socket.id) {
        let damage = attacks?.find((el) => el.name === attackType)?.strength; // Default attack damage
        teams[loggedIn[targetId].teamName].health -= damage;
        loggedIn[targetId].health -= damage;
        teams[loggedIn[socket.id].teamName].attacks[attackType] -= 1; // Reduce the attack count
        io.to(targetId).emit("update-stats", teams[loggedIn[targetId].teamName]);
        io.to(socket.id).emit("attack-result", "Attack successful!");
        io.to(targetId).emit("update-teams", loggedIn);
        io.emit("update-teams", loggedIn);
      }
    }
    console.log({ history: JSON.stringify(history) });
  });
});
app.get("/:universalURL", (req, res) => {
   res.send("404 URL NOT FOUND");
});
server.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});

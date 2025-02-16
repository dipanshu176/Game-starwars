// Socket initialization with query parameters
const socket = io({
  query: {
    socketId: localStorage.getItem("socketId") || "",
  },
});

// Variable declarations
const hostButton = document.getElementById("host-button");
const teamButton = document.getElementById("team-button");
const startGameButton = document.getElementById("start-game-button");
const attackButton = document.getElementById("attack-button");
const teamNameInput = document.getElementById("team-name");
const teamPasswordInput = document.getElementById("team-password");
const passcodeInput = document.getElementById("passcode-input");
const teamSelect = document.getElementById("team-select");
const messageBox = document.getElementById("message-box");
const healthBar = document.getElementById("team-health-bar");
const gameStatus = document.getElementById("game-status");
const leaderboard = document.getElementById("leaderboard");
const actionCount = document.getElementById("action-count");
const attacksContainer = document.getElementById("attack-buttons");

let userType = "";
let currentTeam = "";
let gameStarted = false;
let teams = {};

// Team usernames and passwords
const teamUsernames = {
  alpha: "1",
  beta: "1",
  gamma: "1",
  delta: "1",
  epsilon: "1",
  bond: "1",
};
const names = ["alpha", "beta", "gamma", "delta", "epsilon", "bond"];

// Event Listeners Setup
setupEventListeners();

// Function to set up event listeners
function setupEventListeners() {
  hostButton.addEventListener("click", handleHostLogin);
  teamButton.addEventListener("click", handleTeamLogin);
  startGameButton.addEventListener("click", startGame);
  attackButton.addEventListener("click", handleAttack);

  socket.on("connect", () => localStorage.setItem("socketId", socket.id));
  socket.on("game-started", () => handleGameStarted());
  socket.on("host-message", (message) => (messageBox.textContent = message));
  socket.on("update-teams", (updatedTeams) => handleTeamsUpdate(updatedTeams));
  socket.on("attack-result", (resultMessage) => alert(resultMessage));
  socket.on("game-over", (message) => handleGameOver(message));
}

function handleHostLogin() {
  const passcode = passcodeInput.value;
  if (passcode === "1") {
    userType = "host";
    socket.emit("host-joined");
    updateUIForHost();
  } else {
    alert("Incorrect passcode!");
  }
}

function handleTeamLogin() {
  const teamName = teamNameInput.value;
  const pass = teamPasswordInput.value;
  if (names.includes(teamName) && teamUsernames[teamName] === pass) {
    currentTeam = teamName;
    userType = "team";
    socket.emit("team-joined", { teamName });

    updateUIForTeam();
  } else {
    alert("Please enter a valid team name and password.");
  }
}

function displayTeamAttacks() {
  attacksContainer.innerHTML = ""; // Clear previous contents
  console.log({ here: "here", currentTeam, teams, a: teams[socket.id]?.attacks });
  // Iterate over the attacks object and create a button for each attack
  for (const [attackName, quantity] of Object.entries(teams[socket.id].attacks)) {
    const button = document.createElement("button");
    button.className = "btn";
    button.textContent = `${attackName} (${quantity})`; // Set the button text to attack name and quantity
    button.onclick = function () {
      handleAttack(attackName);
    }; // Add an event listener for the attack

    attacksContainer.appendChild(button);
  }
}

function startGame() {
  socket.emit("start-game");
}

function handleAttack(attackName) {
  const targetId = teamSelect.value;
  console.log({ targetId, gameStarted });
  if (targetId && gameStarted) {
    socket.emit("attack", { targetId, attackType: attackName });
    // updateActionCount();
  }
}

function handleGameStarted() {
  gameStarted = true;
  gameStatus.textContent = "Game has started! You can now attack.";
}

function handleTeamsUpdate(updatedTeams) {
  teams = updatedTeams;
  updateTeamList();
  updateLeaderboard();
  updateHealthBar();
  displayTeamAttacks();
}

function handleGameOver(message) {
  alert(message);
  gameStatus.textContent = message;
}

function updateTeamList() {
  teamSelect.innerHTML = "";
  Object.entries(teams).forEach(([id, team]) => {
    if (id !== socket.id) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = `${team.name} `;
      teamSelect.appendChild(option);
    }
  });
}

function updateLeaderboard() {
  leaderboard.innerHTML = "";
  Object.values(teams)
    .sort((a, b) => b.health - a.health)
    .forEach((team) => {
      const teamElement = document.createElement("div");
      teamElement.textContent = `${team.name}: Health ${team.health}`;
      leaderboard.appendChild(teamElement);
    });
}

function updateHealthBar() {
  if (userType === "team") {
    const ourTeam = teams[socket.id];

    if (ourTeam) {
      const healthPercentage = `${ourTeam.health}%`;
      healthBar.style.width = healthPercentage;
      gameStatus.textContent = `Your Health: ${ourTeam.health}`;
    }
  }
}

function updateActionCount() {
  // Not in use
  const actions = parseInt(actionCount.textContent) - 1;
  actionCount.textContent = actions;
  if (actions <= 0) {
    attackButton.disabled = true;
    gameStatus.textContent = "You've reached the maximum number of actions.";
  }
}

function updateUIForHost() {
  document.getElementById("host-login").style.display = "none";
  document.getElementById("team-login").style.display = "none";
  document.getElementById("host-dashboard").style.display = "block";
  document.getElementById("start-game-button").style.display = "block";
}

function updateUIForTeam() {
  document.getElementById("host-login").style.display = "none";
  document.getElementById("team-login").style.display = "none";
  document.getElementById("team-dashboard").style.display = "block";
  document.getElementById("attack-button").style.display = "block";
}

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

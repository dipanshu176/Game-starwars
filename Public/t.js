const socket = io({
  query: {
    socketId: localStorage.getItem("socketId") || "",
  },
});

// Variables
const hostButton = document.getElementById("host-button");
const teamButton = document.getElementById("team-button");
const startGameButton = document.getElementById("start-game-button");
const attackButton = document.getElementById("attack-button");
const teamNameSelect = document.getElementById("team-name-select");

const teamNameInput = document.getElementById("team-name");

const qwertyInput = document.getElementById("team-name2");
const passcodeInput = document.getElementById("passcode-input");
const teamSelect = document.getElementById("team-select");
const messageBox = document.getElementById("message-box");
const healthBar = document.getElementById("team-health-bar");
const actionCount = document.getElementById("action-count");
const gameStatus = document.getElementById("game-status");
const leaderboard = document.getElementById("leaderboard");
const team_password = document.getElementById("team-password");

let userType = "";
let qwertytype = "";
let currentTeam = "";
let gameStarted = false;
let teams = {};

// const teamUsernames = {
//   alpha: "alpha_123",
//   beta: "beta_7879",
//   gama: "gama_9919",
//   delta: "delta_8888",
//   epsilon: "epsilon_1010",
//   bond: "james_bond_07",
// };
const teamUsernames = {
  alpha: "1",
  beta: "1",
  gama: "1",
  delta: "1",
  epsilon: "1",
  bond: "1",
};
const names = ["alpha", "beta", "gama", "alfred", "batman", "bond"];

// Join as Host
hostButton.addEventListener("click", () => {
  const passcode = passcodeInput.value;
  if (passcode === "1") {
    // Replace with the actual passcode
    userType = "host";
    socket.emit("host-joined");
    updateUIForHost();
  } else {
    alert("Incorrect passcode!");
  }
});

socket.on("connect", () => {
  // Save the socket ID to localStorage
  localStorage.setItem("socketId", socket.id);
});

teamButton.addEventListener("click", () => {
  const teamName = teamNameInput.value;
  const pass = team_password.value;
  if (names.includes(teamName) && teamUsernames[teamName] === pass) {
    currentTeam = teams;
    userType = "team";
    socket.emit("team-joined", { teamName });
    updateUIForTeam();
  } else {
    alert("Please enter a valid team name and password.");
  }
});

// Start Game
startGameButton.addEventListener("click", () => {
  socket.emit("start-game");
});

// Attack
attackButton.addEventListener("click", () => {
  const targetId = teamSelect.value;
  if (targetId && gameStarted && actionsRemaining > 0) {
    socket.emit("attack", targetId);
    // actionsRemaining--;
    updateActionCount();
  }
});

socket.on("game-started", () => {
  gameStarted = true;
  gameStatus.textContent = "Game has started! You can now attack.";
});

socket.on("host-message", (message) => {
  messageBox.textContent = message;
});

socket.on("update-teams", (updatedTeams) => {
  teams = updatedTeams;
  console.log({ teams });
  updateTeamList();
  if (userType === "host") {
    updateLeaderboard();
  }
  if (userType === "team") {
    const ourTeam = teams[socket.id]; // Get our team object
    console.log({ ourTeam });
    if (ourTeam) {
      healthBar.style.width = `${ourTeam.health}%`;
      gameStatus.textContent = `Your Health: ${ourTeam.health}`; // Update health bar using our team stats

      renderTeammatesHealth();
    }
    updateLeaderboard();
  }
});

socket.on("update-stats", (teamStats) => {
  if (userType === "team" && socket.id === teamStats.id) {
    healthBar.style.width = `${teamStats.health}%`;
  }
});

socket.on("attack-result", (resultMessage) => {
  alert(resultMessage);
});

socket.on("game-over", (message) => {
  alert(message);
  gameStatus.textContent = message;
});

function updateTeamList() {
  teamSelect.innerHTML = "";

  for (const [id, team] of Object.entries(teams)) {
    console.log({ id, team });
    if (id !== socket.id) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = `${team.name} (Health: ${team.health})`;
      teamSelect.appendChild(option);
    }
  }
}

function updateLeaderboard() {
  leaderboard.innerHTML = ""; // Clear previous leaderboard
  const sortedTeams = Object.values(teams).sort((a, b) => b.health - a.health); // Sort teams by health (descending)

  sortedTeams.forEach((team) => {
    const teamElement = document.createElement("div");
    teamElement.textContent = `${team.name}: Health ${team.health}`;
    leaderboard.appendChild(teamElement);
  });
}
function renderTeammatesHealth() {
  const teammateList = document.getElementById("teammates-health"); // Assume you have a container for teammates
  teammateList.innerHTML = ""; // Clear the list first

  Object.entries(teams).forEach(([id, team]) => {
    if (id !== socket.id) {
      // Exclude the current user's team
      const teammateDiv = document.createElement("div");
      teammateDiv.textContent = `${team.name} - Health: ${team.health}`;
      teammateDiv.textContent = `${team.name}`;

      teammateList.appendChild(teammateDiv);
    }
  });
}
function updateUIForHost() {
  // Hide login sections and show host dashboard
  document.getElementById("host-login").style.display = "none";
  document.getElementById("team-login").style.display = "none";
  document.getElementById("host-dashboard").style.display = "block";
  document.getElementById("start-game-button").style.display = "block";
}

function updateUIForTeam() {
  // Hide login sections and show team dashboard
  document.getElementById("host-login").style.display = "none";
  document.getElementById("team-login").style.display = "none";
  document.getElementById("team-dashboard").style.display = "block";

  document.getElementById("attack-button").style.display = "block";
}

function updateActionCount() {
  actionCount.textContent = actionsRemaining;
  if (actionsRemaining <= 0) {
    attackButton.disabled = true;

    gameStatus.textContent = "You've reached the maximum number of actions.";
  }
}

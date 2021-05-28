const lobbyChannel = pusher.subscribe(`presence-LOBBY_${roomId}`);
const lobbyData = { members: {}, memberCount: 0 };

// =============================================
// EVENT LISTENERS
// =============================================

lobbyChannel.bind("pusher:subscription_succeeded", (data) => {
  lobbyData.members = data.members;
  lobbyData.memberCount = data.count;
  updatePlayersList();
  joinGame();
});

lobbyChannel.bind("pusher:member_added", (member) => {
  lobbyData.members[member.id] = member.info;
  lobbyData.memberCount += 1;
  updatePlayersList();
});

lobbyChannel.bind("pusher:member_removed", (member) => {
  delete lobbyData.members[member.id];
  lobbyData.memberCount -= 1;
  updatePlayersList();
})

lobbyChannel.bind('GAME_START', (data) => {
  window.location.replace(`/game/${data.gameId}`);
});

// =============================================
// COMMUNICATING WITH THE BACKEND API
// =============================================

async function joinGame() {
  await fetch(`/api/game/join/${roomId}`).then(res => res.json());
}

// =============================================
// RENDER METHODS
// =============================================

function updatePlayersList() {
  // Clear all players before we re-render them.
  document.querySelector("#connected-players").innerHTML = null;
  // Update player count
  document.getElementById("lobby-player-count").innerText = ` ${4-lobbyData.memberCount} `;

  // Render each player to the connected players list.
  Object.values(lobbyData.members).forEach((player, i) => {
    let html = `
    <div class="col-sm-4">
      <div class="small text-muted">Player ${i+1}</div>
      <div class="text-success">${player.username}</div>
    </div>
    `;
    document.querySelector("#connected-players").insertAdjacentHTML('beforeend', html);
  });

  // Hide the loading spinner
  document.getElementById('loading').setAttribute('hidden', true);
  // Show the lobbby status
  document.getElementById('lobby-status').removeAttribute('hidden');

}
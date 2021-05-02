const lobbyChannel = pusher.subscribe(`LOBBY_${roomId}`);

lobbyChannel.bind('PLAYER_JOIN', (data) => {
  updatePlayersList(data);
});

lobbyChannel.bind('GAME_START', (data) => {
  console.log('game starting...');
});


function updatePlayersList(players) {
  // Render each player to the connected players list.
  players.forEach((player) => {
    let element = document.getElementById(`player-${player.player_num}-name`);
    element.innerText = player.username;
    element.className = "text-success";
  });

  // Unhide the connected players list
  document.getElementById('connected-players').removeAttribute('hidden');

  // Hide the loading spinner
  document.getElementById('loading').setAttribute('hidden', true);
}
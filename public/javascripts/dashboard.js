// =============================================
// EVENT LISTENERS
// =============================================
window.onload = async () => {
  const games = await getGamesList();
  renderGamesList(games);
};

document.getElementById("new-game-btn").addEventListener("click", async () => {
  const createdGameId = await createGame();
  if(createdGameId) {
    await joinGame(createdGameId);
  }
});

// =============================================
// COMMUNICATING WITH THE BACKEND API
// =============================================

// Makes the API call for getting the list of active games.
async function getGamesList() {
  const data = await fetch('/api/game/getList').then(res => res.json());
  return data.games;
}

// Makes the API calls required to create a new game.
async function createGame() {
  const createdGame = await fetch('/api/game/create').then(res => res.json());
  
  if(createdGame.status === 'success') {
    return createdGame.id;
  } else {
    return null;
  }
}

async function joinGame(gameId) {
  const joinedGame = await fetch(`/api/game/join/${gameId}`).then(res => res.json());
    
  if(joinedGame.status === 'success') {
    window.location.replace(`/game/lobby/${gameId}`);
  } else {
    // TODO: Render error messages.
    console.log('Could not join game.');
  }
}

// =============================================
// RENDER METHODS
// =============================================

// Takes an array of games and renders them.
function renderGamesList(games) {  
  games.forEach((game, i) => {
    let html = `
      <div class="col">
        <div class="card bg-dark text-white h-100">
        <div class="card-body">
            <h4 class="card-title">Game ${i}</h4>
            <p class="small text-muted">${game.numPlayers}/4</p>
        </div>
        <div class="card-footer d-grid">
          ${
            game.isGameUser ?
              `<a class="btn btn-warning" type="button" href="/game/lobby/${game.id}">Rejoin </a>` : 
              `<a class="btn btn-primary" type="button" onclick="joinGame('${game.id}')">Join </a>`
          }
          </div>
      </div>
      </div>
    `;

    document.querySelector('#active-games').insertAdjacentHTML('beforeend', html);
  });
}
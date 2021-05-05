// =============================================
// EVENT LISTENERS
// =============================================
window.onload = async () => {
  const games = await getGamesList();
  renderGamesList(games);
};

document.getElementById("new-game-btn").addEventListener("click", async () => {
  const createdGameId = await createGame();

  // Send the user to the lobby on success.
  if(createdGameId) {
    window.location.replace(`/game/lobby/${createdGameId}`);
  } else {
    // TODO: Display error alert.
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

// Makes the API call required to create a new game.
async function createGame() {
  const createdGame = await fetch('/api/game/create').then(res => res.json());
  
  if(createdGame.status === 'success') {
    return createdGame.id;
  } else {
    return null;
  }
}

// =============================================
// RENDER METHODS
// =============================================

// Takes an array of games and renders them.
function renderGamesList(games) {
  // If no active games exist, show an alert.
  if(!(games.length > 0)) {
    document.getElementById('no-active-games-alert').removeAttribute('hidden');
    return;
  }

  // Otherwise hide the alert render the games.
  document.getElementById('no-active-games-alert').setAttribute('hidden', true);
  games.forEach((game, i) => {
    let html = `
      <div class="col">
        <div class="card bg-dark text-white h-100">
        <div class="card-header text-muted small">Game: #${i+1}</div>
        <div class="card-body">
            <div class="card-title text-start">
              ${
                game.numPlayers == 4 ?
                  '<div class="card-text text-warning">In progress</div>'
                  :
                  '<div class="card-text text-success">In lobby</div>'
              }
            </div>
            <div class="card-subtitle text-muted text-start">${game.numPlayers}/4 players</div>
        </div>
        <div class="card-footer d-grid">
          ${
            game.isGameUser ?
              `<a class="btn btn-warning" type="button" href="/game/${game.id}">
                <i class="fa fa-arrow-right"></i>
                Resume
              </a>` 
              : 
              `<a class="btn btn-success" type="button" href="/game/lobby/${game.id}">
                <i class="fa fa-arrow-up"></i>
                Join
              </a>`
          }
          </div>
      </div>
      </div>
    `;

    document.querySelector('#active-games').insertAdjacentHTML('beforeend', html);
  });
}
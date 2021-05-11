/*import '/stylesheets/cardSize.css';*/
const gameStateChannel = pusher.subscribe(`presence-STATE_${roomId}${userId}`);
const gameData = { members: {}, memberCount: 0}




// ====================================================================
// Event Listeners
// ====================================================================
gameStateChannel.bind("pusher:subscription_succeeded", async (data) => {
  gameData.members = data.members;
  gameData.memberCount = data.count;

  // Get initial state on initial channel subscription.
  requestGameState();
})

gameStateChannel.bind("pusher:member_added", (member) => {
  gameData.members[member.id] = member.info;
  gameData.memberCount += 1;
});

gameStateChannel.bind("pusher:member_removed", (member) => {
  delete gameData.members[member.id];
  gameData.memberCount -= 1;
})

gameStateChannel.bind("GAME_STATE", (data) => {
  console.log("Got state!");
  console.log(data);
  
  renderCards(data);
})

document.querySelector("#draw-card").addEventListener("click", async () =>  {
  drawCard();
})


// ====================================================================
// Communicating with the backend API
// ====================================================================
async function requestGameState() {
  await fetch(`/api/game/state/${roomId}`).then(res => res.json());
}

async function drawCard() {
  await fetch(`/api/game/makeMove/${roomId}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({type: "-1"}),
    method: "POST"
  })
}


// ====================================================================
// render functions
// ====================================================================

//<div class="face-up uno-card-${element.color}-${element.value}"></div>
{/*
 <div class="my-card">
<div class="face-up uno-card-red-1"></div>
 
</div> 
*/}


function renderCards(state){ 
  leftPlayer = ((state.user.playerNum + 1) % 4) == 0 ? 4 : ((state.user.playerNum + 1) % 4);
  topPlayer = ((state.user.playerNum + 2) % 4) == 0 ? 4 : ((state.user.playerNum + 2) % 4);
  rightPlayer = ((state.user.playerNum + 3) % 4) == 0 ? 4 : ((state.user.playerNum + 3) % 4);
  let html = `
    <div class="my-card">
    <img src="../images/unocards.png".face-down height = '100'>
    
    </div>
    `;;
    document.querySelector("#left-player").innerHTML = null;
    document.querySelector("#top-player").innerHTML = null;
    document.querySelector("#right-player").innerHTML = null;
    document.querySelector("#last-played-card").innerHTML = null;

    for( let i=0; i<state.otherPlayers[leftPlayer].handLength;i++)
    {
      document.querySelector("#left-player").insertAdjacentHTML('beforeend', html);
    
    }
    for( let i=0; i<state.otherPlayers[topPlayer].handLength;i++)
    {
      document.querySelector("#top-player").insertAdjacentHTML('beforeend', html);
    
    }
    for( let i=0; i<state.otherPlayers[rightPlayer].handLength;i++)
    {
      document.querySelector("#right-player").insertAdjacentHTML('beforeend', html);
    
    }

    html = `
    <div class="my-card">
    <svg class="face-up uno-card uno-card-${state.lastPlayedCard.color}-${state.lastPlayedCard.value}"></svg>
    </div>
    `;

    document.querySelector("#last-played-card").insertAdjacentHTML('beforeend', html);
    
    

  document.querySelector("#user-player").innerHTML = null;
    state.user.cards.forEach(element => {
     
      let html = `
      <div class="my-card">
      <svg class="face-up uno-card uno-card-${element.color}-${element.value}"></svg>
      </div>
      `;
      document.querySelector("#user-player").insertAdjacentHTML('beforeend', html);
     

      });




      
}

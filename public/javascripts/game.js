/*import '/stylesheets/cardSize.css';*/
const gameStateChannel = pusher.subscribe(`presence-STATE_${roomId}${userId}`);
const gameData = { members: {}, memberCount: 0}

console.log(gameData);


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
  otherprenderCards(data);
  console.log(data.otherPlayers[`${leftPlayer}`])
})


// ====================================================================
// Communicating with the backend API
// ====================================================================
async function requestGameState() {
  await fetch(`/api/game/state/${roomId}`).then(res => res.json());
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
  leftPlayer = ((state.user.playerNum + 1) % 4) + 1
  topPlayer = ((state.user.playerNum + 2) % 4) + 1
  rightPlayer = ((state.user.playerNum + 3) % 4) + 1
  let html = `
    <div class="my-card">
    <img src="../images/unocards.png".face-down height = '100'>
    </div>
    `;;
    document.querySelector("#left-player").innerHTML = null;
    document.querySelector("#top-player").innerHTML = null;
    document.querySelector("#right-player").innerHTML = null;
    for( let i=0; i<state.otherPlayers[`${leftPlayer}`];i++)
    {
      document.querySelector("#left-player").insertAdjacentHTML('beforeend', html);
    
    }
    for( let i=0; i<state.otherPlayers[`${topPlayer}`];i++)
    {
      document.querySelector("#top-player").insertAdjacentHTML('beforeend', html);
    
    }for( let i=0; i<state.otherPlayers[`${rightPlayer}`];i++)
    {
      document.querySelector("#right-player").insertAdjacentHTML('beforeend', html);
    
    }

    
    

  document.querySelector("#user-player").innerHTML = null;
    state.user.cards.forEach(element => {
     
      let html = `
      <div class="my-card">
      <svg class="face-up uno-card uno-card-${element.color}-${element.value}"></svg>
      </div>
      `;;
      document.querySelector("#user-player").insertAdjacentHTML('beforeend', html);
     

      });




      
}


function otherprenderCards(state){ 
  state.user.cards.forEach(element => {
     
    let html = `
    <div class="my-card">
    <img src="../images/unocards.png".face-down/ height = '90px'
    width= '64px';>
    </div>
    `;;
    
    document.querySelector("#right-player").insertAdjacentHTML('beforeend', html);
    document.querySelector("#top-player").insertAdjacentHTML('beforeend', html);
    document.querySelector("#left-player").insertAdjacentHTML('beforeend', html);
    
    
   

    });


    
}
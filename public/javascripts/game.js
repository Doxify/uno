const gameStateChannel = pusher.subscribe(`presence-STATE_${roomId}${userId}`);
const gameData = { members: {}, memberCount: 0 }

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
    state.user.cards.forEach(element => {
     
      let html = `
      <div class="my-card">
      <svg class="face-up uno-card uno-card-${element.color}-${element.value}"></svg>
      </div>
      `;
      document.querySelector("#user-player").insertAdjacentHTML('beforeend', html);

      });

}
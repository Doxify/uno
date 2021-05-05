// ====================================================================
// Fetch/Client HTTP Request Logic Below
// ====================================================================

document.getElementById("draw-card").addEventListener("click", (event) => {
    console.log("Send draw card move request to server.");

    // TODO: Implement Fetch logic here
});



// ====================================================================
// Pusher/Socket Logic Below
// ====================================================================
const userId = document.getElementById("userId").value;
const stateChannel = pusher.subscribe(`STATE_${roomId}${userId}`);

stateChannel.bind('update', (data) => {
    // Do something on state update.

    var data = {
        isGameOver: false,
        otherPlayers: [
            {
                handLength: 7,
                playerNum: 4,
            },
            {
                handLength: 7,
                playerNum: 1,
            },
            {
                handLength: 7,
                playerNum: 2,
            },
        ],
        user: {
            cards: [
                {
                    value: 2,
                    color: "Red",
                },
                {
                    value: 3,
                    color: "Green",
                },
                {
                    value: 2,
                    color: "Blue",
                },

            ],
            handLength: 7,
            playerNum: 3,
        },
        lastPlayedCard: {
            value: 6,
            color: "Yellow",
        }
    }

    console.log(data);

    // Render lastPlayedCard


    // Check if game is over


    // Render user cards


    // Render other player cards
    
        // Render Left Player -> Top Player -> Right Player

});

// ====================================================================
// Dynamic Page Logic Below
// ====================================================================

document.getElementById("chat-close-btn").addEventListener("click", function(event) {
    closeChat(event);
});

document.getElementById("chat-open-btn").addEventListener("click", function(event) {
    openChat(event);
});



function openChat(event) {

    event.preventDefault()
    chatSidebar = document.getElementsByClassName("chat-sidebar")[0];
    chatClosed = document.getElementById("chat-sidebar-closed");


    chatSidebar.classList.remove("hidden");
    chatClosed.classList.add("hidden");


}


function closeChat(event) {
    event.preventDefault();
    chatSidebar = document.getElementsByClassName("chat-sidebar")[0];
    chatClosed = document.getElementById("chat-sidebar-closed");



    chatSidebar.classList.add("hidden")
    chatClosed.classList.remove("hidden")
}
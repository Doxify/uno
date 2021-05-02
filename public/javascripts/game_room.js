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
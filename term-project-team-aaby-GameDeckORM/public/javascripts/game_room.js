

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
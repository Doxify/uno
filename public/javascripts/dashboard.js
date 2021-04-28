let _chatId = document.getElementById("")

document.getElementById("chatbox-btn").addEventListener("click", function(event) {
    chatbox(event);
});

function chatbox(event) {
  let userInput = document.getElementById("userInput");
  var messageHTML = `
    <div class="chat-message-container"> 
      <div class="chat-message-time">12:30</div>
      <div class="chat-message-user">User: </div> 
      <div class="chat-message"> ${userInput.value}</div>
    </div>
  `;
  // Add comment here
  document.querySelector(".chatbox").insertAdjacentHTML('beforeend', messageHTML);
  userInput.value = "";
}
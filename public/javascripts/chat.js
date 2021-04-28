const pusher = new Pusher('968799b8f88c1d76da50', { cluster: "us3" });
const roomId = document.getElementById("chatId").value;
const channel = pusher.subscribe(`CHAT_${roomId}`);

// Listening for when the user presses the send button in chat.
document.getElementById("chatbox-btn").addEventListener("click", function(event) {
  sendMessage(event);
});

// Listening for all messages sent in this channel.
channel.bind('message', (data) => {
  updateChatBox(data);
});

function sendMessage(event) {
  var userInput = document.getElementById("userInput");
  const formData = { id: roomId, message: userInput.value };

  // Making the API call to trigger pusher.
  fetch('/api/chat/', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
    method: "POST"
  });

  // Clearing the chat message input box.
  userInput.value = "";
}

function updateChatBox(data) {
  var messageHTML = `
    <div class="chat-message-container"> 
      <div class="chat-message-time">${data.timestamp}</div>
      <div class="chat-message-user">${data.username}:</div> 
      <div class="chat-message"> ${data.message}</div>
    </div>
  `;
  // Append comment to the chatbox.
  document.querySelector(".chatbox").insertAdjacentHTML('beforeend', messageHTML);
}
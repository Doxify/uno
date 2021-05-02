const pusher = new Pusher('968799b8f88c1d76da50', { cluster: "us3" });
const roomId = document.getElementById("roomId").value;
const userInput = document.getElementById("userInput");
const chatChannel = pusher.subscribe(`CHAT_${roomId}`);

// Listening for when the user presses the send button in chat.
document.getElementById("chatbox-btn").addEventListener("click", function(event) {
  // Validating input
  if(userInput.value === "") return;
  if(userInput.value.trim() === "") return;

  // Send the message if it passes validation and clear the input box.
  sendMessage(event);
  userInput.value = "";
});

// Listening for all messages sent in this channel.
chatChannel.bind('message', (data) => {
  updateChatBox(data);
});

function sendMessage(event) {
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
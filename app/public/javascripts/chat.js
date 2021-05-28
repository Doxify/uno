const userInput = document.getElementById("userInput");
const chatChannel = pusher.subscribe(`CHAT_${roomId}`);

// Listening for when the user presses the send button in chat.
document.getElementById("chatbox-btn").addEventListener("click", function(event) {
  event.preventDefault();

  // Validating input
  if(userInput.value === "") return;
  if(userInput.value.trim() === "") return;

  // Send the message if it passes validation and clear the input box.
  sendMessage(userInput.value);
  userInput.value = "";
});

// Listening for all messages sent in this channel.
chatChannel.bind('message', (data) => {
  updateChatBox(data);
  console.log('Message revid via web sockets')
});

function sendMessage(message) {
  const formData = { id: roomId, message: message };

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
      <div class="chat-message-time text-muted">${data.timestamp}</div>
      <div class="chat-message-user">${data.username}:</div> 
      <div class="chat-message"> ${data.message}</div>
    </div>
  `;
  // Append comment to the chatbox.
  document.querySelector(".chatbox").insertAdjacentHTML('beforeend', messageHTML);
  document.querySelector(".chatbox").scrollTop = document.querySelector(".chatbox").scrollHeight;
}
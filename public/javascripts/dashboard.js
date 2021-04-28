let _chatbox = document.getElementsByClassName('chatbox');

document.getElementById("chatbox-btn").addEventListener("click", function(event) {
    chatbox(event);
});




function chatbox(event){ 

  let userInput = document.getElementById("userInput").value;
  let addedhtml = `<div class="chat-message-container"> 
                 <div class=chat-messge-time"></div>
                 <div class=chat-messge-user> </div> 
                <div class="chat-message> ${userInput}</div>
                </div>; `
 document.getElementsByClassName('chatbox').insertAdjacentHTML('afterend', addedhtml);

//   let chat_container = document.createElement("div");
//   chat_container.class = "chat-message-container"
  
//   let message = document.createElement("div");
//   message.class = "chat-message";
//   let msg = document.createTextNode(userInput);
//   message.appendChild(msg);
  

//    chat_container.appendChild(message);
//   let a =  document.getElementsByClassName('chatbox').append(chat_container); 
//   console.log(a);

//    let addedhtml = '<div class="chat-message-container">  </div>'; 

 
//    let html = document.createElement(addedhtml)

//    let content = document.createTextNode(html); 
//   console.log(chatbox);
           

 // alert(content)
  

  
//   let addMessage = document.getElementById("chat-message").append(userInput);
//   alert(userInput)
//   //alert("hi")



//   .chat-message-container 
//   .chat-message-time 12:00
//   .chat-message-user Username:
//   .chat-message Example of a small message
  

}
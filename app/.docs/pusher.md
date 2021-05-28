# Pusher Documentation
Last Updated: 4/28/21 09:27

## **What is Pusher?**
Pusher is websockets-as-a-service. Its goal is to eliminate the hassle associated
with creating and managing channels. Using Pusher is as simple as sending an event on a
channel and then listening for that event on the same channel.


### **Channels**
These are rooms and they should have a UNIQUE name. Channels can have an
infinite amount of events. 

When the frontend 
***subscribes*** to a channel, it means that it will listen to all events that
are sent on that channel.

You do not need to do anything fancy to create or delete a channel. In Pusher,
channels are just strings.

### **Events**
These do not need to be unique, but they should describe the event that is
ocurring.

Events are also strings so you do not need to do anything fancy to create or
delete events either.
 
<br>

# **How to use Pusher**
When using pusher there are two things you must implement.

1. The backend component
2. The frontned component

## **1. The backend component**
The backend is where all pusher events originate from. This means that you must
create a controller in order to send pusher events.

Here is how the chat controller is setup:

1. Create a route in `app.js` called `/api/chat` which points to the chat router:

```javascript
const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/Chat');
const { isAuthed } = require('../middleware/routeProtectors');

router.post('/', isAuthed, (req, res, next) => {
  ChatController.send(req, res, next);
});

module.exports = router;
```

2. Create a Controller for the route to use:

```javascript
const pusher = require('../config/pusher');

const Controller = {
  send: (req, res, next) => {
    const { id, message } = req.body;
    const channel = `CHAT_${id}`;
    const timestamp = new Date();

    // Trigger pusher
    pusher.trigger(channel, 'message', {
      username: req.user.username,
      message: message,
      timestamp: `${timestamp.getHours()}:${timestamp.getMinutes()}`
    });

    return res.json(200);
  }
};

module.exports = Controller;
```

In this example, the channel is "`CHAT_`" followed by the id passed in the
request's body and the event is "`message`". The third parameter, the JSON object,
is what is passed to pusher. This means that everyone who is subscribed to the
channel "`CHAT_<id>`" can listen to the "`message`" event and access the JSON data
we are passing here.

## **2. The frontend component**
The frontend is where we LISTEN to Pusher channels and then modify the DOM. 

Here is how the frontend utilizes pusher to make dashboard chat work:

1. Add the Pusher and chat scripts to the dashboard.pug view:

```javascript
script(src="https://js.pusher.com/7.0/pusher.min.js")
script(src="/javascripts/chat.js" defer)
```

2. Use the chat.js script to initialize and subscribe to a pusher channel.
   ***The code here is snipped, look at the `/public/javascripts/chat.js` file
   to see all of the code.***
```javascript
const pusher = new Pusher('968799b8f88c1d76da50', { cluster: "us3" });
const channel = pusher.subscribe(`CHAT_${roomId}`);

// Listening for all messages sent in this channel.
channel.bind('message', (data) => {
  updateChatBox(data);
});
```

In this code, whenever an event named "`message`" is sent on the channel we
subscribed to, we execute the `updateChatBox()` method and pass it the data we
recieved from the event.
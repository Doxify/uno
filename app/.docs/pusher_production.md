# Using Pusher in Production
Last Updated: 5/2/21 14:08

## **How Pusher is used**
The goal with using pusher is to make the server the only source of truth. 

In order to accomplish this, we need to utilize scripts on the frontend which
"listen for the truth".

You can accomplish this by doing the following:
1. Always import the `_pusher.js` script before any scripts that use the Pusher object.
```javascript
  script(src="/javascripts/_pusher.js" defer) // <-- imported first
  script(src="/javascripts/chat.js" defer)
  script(src="/javascripts/lobby.js" defer)
```

2. Subscribe to a channel that you want to listen for events on.
```javascript
const lobbyChannel = pusher.subscribe(`LOBBY_${roomId}`);
```

3. Create event listeners for specific events on said channel. These event
   listeners are almost always going to execute some code that updates the
   frontend. This is how we accomplish updating the page without refreshing.
```javascript
lobbyChannel.bind('PLAYER_JOIN', (data) => {
  updatePlayersList(data);
});
```

## **Triggering an event from the backend**
Thus far, I found that the best time to trigger an event is AFTER a page is
rendered. I found that if you execute pusher code immediately
after you render the page, you cannot guarantee that the frontend has actually
loaded the scripts which listen for events.

The solution to this (it seems hacky/dirty) is to use the `setTimeout()`
function.

Here is an example of me doing this on the lobby page. For this example, assume
that all validation has occured and we are just rendering the lobby page.

```javascript
router.get('/lobby/:uuid', isAuthed, function(req, res, next) {
  res.render('lobby', { title: 'Lobby', user: req.user, gameId: req.params.uuid });
  setTimeout(() => {
      GamePusherController.TRIGGER_PLAYER_JOINED_LOBBY(req.params.uuid);
  }, 1000);
});

```
One second (1000 ms) after the lobby page is rendered, we execute the function
that sends the current state to a given lobby.

I also think its a good idea to have a separate controller that is responsible
for transmitting the state of games. 
Here's what the `GamePusherController` file looks like:

```javascript
const User = require('../database/User');
const GameUser = require('../database/GameUser');
const pusher = require('../config/pusher');

const GamePusherController = {
  // Takes an instance of User and announces that they have joined the Game. 
  TRIGGER_PLAYER_JOINED_LOBBY: (gameId) => {
    GameUser.getGameUsers(gameId)
      .then((gameUsers) => {
        if(gameUsers) {

          // Create all promises to get each GameUser's username.
          var promises = [];
          gameUsers.forEach(gameUser => {
            promises.push(
              User.getUser(gameUser.user)
                .then(user => {
                  gameUser.username = user.username;
                })
            )
          })

          // Execute all promises and trigger pusher.
          Promise.all(promises).then(() => {
            const channel = `LOBBY_${gameId}`;
            const event = 'PLAYER_JOIN';

            pusher.trigger(channel, event, gameUsers);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      })
  }
};

module.exports = GamePusherController;
```
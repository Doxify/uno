const BaseDeck = require('../database/BaseDeck')
const GameDeck = require('../database/GameDeck')
const GameUser = require('../database/GameUser')
const GameDeckCard = require('../database/GameDeck')


const GameDeckController = {

    // These functions should only be called within the Game controller after Game instance
    // has reached max number of players
    createGameDeck: (game) => {

        // Need to get all game users of game from database
        return new Promise((resolve, reject) => {
            GameUser.getGameUsers(game)
                .then((gameUsers) => {

                    if (gameUsers.length < GameUser.MAX_GAME_USERS_PER_GAME) {
                        // TODO: Throw error
                        return resolve(null);
                    }
                    console.log("got here");

                    // Need to get Base Deck from database
                    BaseDeck.getDeck()
                        .then((baseDeck) => {
                            console.log("got base deck");
                            // Iterate over baseDeck array and create Game Deck Card objects
                            gameDeck = [];

                            baseDeck.forEach((card, i) => {
                                let gameCard = new GameDeckCard(game, null, card.id, 0);

                                gameDeck.push(gameCard);
                            });

                            console.log("created game deck array");
                            // Shuffle gameDeck
                            GameDeckController.shuffle(gameDeck, 2);

                            console.log("shuffled game deck");

                            // Deal 7 cards to each Game User
                            gameDeck = GameDeckController.dealCards(gameUsers, gameDeck);

                            console.log("dealt cards")

                            // Insert all Game Deck Card objects into database using Promise.all
                            var promises = [];

                            gameDeck.forEach((gameCard) => {
                                // console.log(gameCard);
                                promises.push(
                                    gameCard.save()
                                );
                            });

                            console.log("created all promises");


                            Promise.all(promises)
                                .then(() => {
                                    console.log("added everything to database");
                                    resolve(true)
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                        });

                })
                .catch((err) => {
                    console.log(err);
                });
        });

    },

    shuffle: (gameDeck, numShuffles) => {

        if (!(gameDeck instanceof Array)) {
            throw new Error("gameDeck must be an array.");
        }

        if (!(gameDeck[0] instanceof GameDeckCard)) {
            throw new Error("gameDeck objects must be a GameDeckCard object.");
        }

        const numCards = gameDeck.length;

        for (let shuffles = 0; shuffles < numShuffles; shuffles++) {

            // Shuffle gameDeck cards in array
            for (let i = 0; i < numCards; i++) {

                const randomIndex = Math.floor(Math.random() * numCards);

                const tmp = gameDeck[randomIndex];

                gameDeck[randomIndex] = gameDeck[i];
                gameDeck[i] = tmp;
            }

        }

        // Iterate over array again and update order values of GameDeckCard object
        gameDeck.forEach((gameCard, i) => {
            // console.log(i);
            gameCard.order = i;
        });

        return gameDeck;
    },

    // Deal 7 cards to each game user
    // gameUsers: Array of GameUser objects
    // gameDeck: Array of GameDeckCard objects
    dealCards: (gameUsers, gameDeck) => {
        if (!(gameUsers instanceof Array)) {
            throw new Error("gameUsers must be an array")
        }

        if (!(gameDeck instanceof Array)) {
            throw new Error("gameDeck must be an array.");
        }

        if (!(gameDeck[0] instanceof GameDeckCard)) {
            throw new Error("gameDeck objects must be a GameDeckCard object.");
        }

        topCard = 0;
        for (let i = 0; i < 7; i++) {

            for (let gameUser of gameUsers) {
                gameDeck[topCard].user = gameUser.user;
                gameDeck[topCard].order = GameDeckCard.DRAWN;
                topCard++;
            }
        }

        // Put the next card at the top of the deck as the last played card
        gameDeck[topCard].order = GameDeckCard.LAST_PLAYED;

        return gameDeck;
    }
}

module.exports = GameDeckController;
const BaseDeck = require('../database/BaseDeck')
const GameDeck = require('../database/GameDeck')
const GameUser = require('../database/GameUser')
const GameDeckCard = require('../database/GameDeck')
const BaseDeckCard = require('../database/BaseDeck')


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
                            // Iterate over baseDeck array and create Game Deck Card objects
                            gameDeck = [];

                            baseDeck.forEach((card, i) => {
                                let gameCard = new GameDeckCard(game, null, card.id, 0);

                                gameDeck.push(gameCard);
                            });

                            // Shuffle gameDeck
                            GameDeckController.shuffle(gameDeck, 2);


                            // Deal 7 cards to each Game User
                            gameDeck = GameDeckController.dealCards(gameUsers, gameDeck)
                                .then((deck) => {

                                    // Insert all Game Deck Card objects into database using Promise.all
                                    var promises = [];

                                    deck.forEach((gameCard) => {
                                        // console.log(gameCard);
                                        promises.push(
                                            gameCard.save()
                                        );
                                    });


                                    Promise.all(promises)
                                        .then(() => {
                                            resolve(true)
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            resolve(false)
                                        })
                                })
                                .catch((err) => {
                                    console.log(err);
                                    resolve(false)
                                })

                        });

                })
                .catch((err) => {
                    console.log(err);
                    resolve(false)
                });
        });

    },
    // Reshuffles all of the played cards in a game deck for a game
    reshuffle: (gameId) => {
        console.log("RESHUFFLING DECK");
        return new Promise((resolve, reject) => {
            GameDeckCard.getAllPlayedCards(gameId)
                .then((playedCards) => {

                    // Need to get the rest of the cards in the deck, amount=0 means get all
                    GameDeckCard.getMultipleTopCards(game, 0)
                        .then((deckCards) => {
                            // Combine decks
                            deckCards = deckCards.concat(playedCards);

                            // Shuffle deck
                            deckCards = GameDeckController.shuffle(deckCards, 2)

                            // Update each played card in database
                            var promises = []

                            deckCards.forEach((card) => {
                                GameDeckCard.update(
                                    { game: card.game, card: card.card },
                                    { order: card.order }
                                )
                            })

                            Promise.all(promises)
                                .then(() => {
                                    resolve(true)
                                })
                                .catch((err) => {
                                    console.log(err);
                                    resolve(false);
                                })
                        })
                })
                .catch((err) => {
                    console.log(err);
                    resolve(false)
                })
        })
    },
    // Shuffles a given array of game deck cards
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
        return new Promise((resolve, reject) => {

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

            // Find the first card not in a user's hand and has an ID <= 76.
            // (cards with ID > 76 are all special cards)
            let randomLastPlayedCard = gameDeck.filter(i => i.user == null && i.card <= 76)[0];

            BaseDeckCard.getCard(randomLastPlayedCard.card)
                .then((baseCard) => {
                    randomLastPlayedCard.order = GameDeckCard.getLastPlayedCardOrder(baseCard.color);
                    return resolve(gameDeck);
                })
        })
    },
    // Return top card of deck
    getTopCard: (game) => {
        return new Promise((resolve, reject) => {
            GameDeckCard.getTopCard(game)
                .then((gameCard) => {
                    // Check how many cards are left in the game deck
                    GameDeckCard.getNumberGameDeckCards(game)
                        .then((numberOfCards) => {
                            if (numberOfCards > 5) return resolve(gameCard);

                            // Reshuffle deck and then return gameCard
                            GameDeckController.reshuffle(game)
                                .then((shuffled) => {
                                    return resolve(gameCard);
                                })
                                .catch((err) => {
                                    // Shuffling failed, still need to return gameCard
                                    console.log(err);
                                    return resolve(gameCard);
                                })
                        })
                        .catch((err) => {
                            console.log(err);
                            return resolve(gameCard);
                        })
                })
                .catch((err) => {
                    console.log(err);
                    return reject(err);
                })
        })
    },
    getMultipleTopCards: (game, amount) => {
        return new Promise((resolve, reject) => {
            GameDeckCard.getMultipleTopCards(game, amount)
                .then((cards) => {
                    // Check how many cards are left in the game deck
                    GameDeckCard.getNumberGameDeckCards(game)
                        .then((numberOfCards) => {
                            if (numberOfCards > 5) return resolve(cards);

                            // Reshuffle deck and then return cards
                            GameDeckController.reshuffle(game)
                                .then((shuffled) => {
                                    return resolve(cards);
                                })
                                .catch((err) => {
                                    // Shuffling failed, still need to return cards
                                    console.log(err);
                                    return resolve(cards);
                                })
                        })
                        .catch((err) => {
                            console.log(err);
                            return resolve(cards);
                        })
                })
                .catch((err) => {
                    console.log(err);
                    return reject(err);
                })
        })
    }
}

module.exports = GameDeckController;
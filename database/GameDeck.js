const ActiveRecord = require('./ActiveRecord');
var BaseDeck = require('./BaseDeck');


class GameDeckCard extends ActiveRecord{
    static table_name = "Game Deck";
    static fields = ['game','user', 'card', 'order'];

    static LAST_PLAYED = -1;
    static DRAWN = -2;
    static PLAYED = -3;


    game = undefined;
    user = undefined;
    card = undefined;
    order = undefined;


    constructor(game, user, card, order) {
        super();
        this.game = game;
        this.user = user;
        this.card = card;
        this.order = order;
    }

    get game() {
        return this.game;
    }

    get user() {
        return this.user;
    }

    get card() {
        return this.card;
    }

    get order() {
        return this.order;
    }

    set order(order) {
        this.order = order;
    }



    // Inserts a game deck into the database
    // gameDeck: Array of GameDeckCard objects
    static createGameDeck(gameDeck) {

        // Need to save each GameDeckCard object individually, so use Promise.all
        var promises = [];

        gameDeck.forEach((gameCard) => {
            console.log(gameCard);

            promises.push(
                gameCard.save()
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    })
            );
        });

        // Run all promises and return gameDeck for further use
        return new Promise((resolve, reject) => {
            Promise.all(promises)
            .then(() => {
                resolve(gameDeck);
            });
        });
    }

    
    static getGameDeck(game) {
        return new Promise((resolve, reject) => {
            GameDeckCard.findAll('game', game)
                .then((gameDeckData) => {
                    
                    let gameDeck = [];

                    // This should always return a JSON array of 108 GameDeck rows

                    // For each row in JSON array, create GameDeckCard objects
                    for(let gameCardData of gameDeckData) {
                        let gameCard = new GameDeckCard(gameCardData.game, gameCardData.user, gameCardData.card, gameCardData.order);

                        gameDeck.push(gameCard);
                    }

                    resolve(gameDeck);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    static getTopCard(game) {
        return new Promise((resolve, reject) => {
            GameDeckCard.findOne('order', 0, ">", true)
                .then((gameCardData) => {
                    // Create GameDeckCard object
                    let gameCard = new GameDeckCard(gameCardData.game, gameCardData.user, gameCardData.card, gameCardData.order);

                    resolve(gameCard);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    static getLastPlayedCard(game) {
        return new Promise((resolve, reject) => {
            GameDeckCard.findAll('game', game)
                .then((gameDeck) => {
                    gameDeck.forEach((card) => {
                        if(card.order === this.LAST_PLAYED) {
                            return resolve(card);
                        }
                    })
                    return resolve(null);
                })
                .catch((err) => {
                    return reject(err);
                })
        })
    }


    // Save GameDeckCard into Game Deck table in database with the values from the instance data fields
    save() {
        const data = {
            game: this.game,
            user: this.user,
            card: this.card,
            order: this.order
        }

        return new Promise((resolve, reject) => {
            GameDeckCard.create(data)
                .then((gameDeckCard) => {
                    if (!gameDeckCard) {
                        resolve(null);
                    }
                    resolve(this);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}

module.exports = GameDeckCard;




    


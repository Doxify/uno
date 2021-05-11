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


        // return new Promise((resolve, reject) => {
        //     GameDeckCard.all().then((deckk) => {
                
        //         const newdeck = new base_Deck();
        //         newdeck.shuffle()
        //         console.log('new deck');
        //         console.log(newdeck.cards);
        //         var hn = newdeck.cards;
                
        //         const grounddeck = new Stack();
        //         const player1 = new Stack();
        //         const player2 = new Stack();
        //         const player3 = new Stack();
        //         const player4 = new Stack();

        //         for(let i=0; i<108; i++)
        //         {
        //             if(player1.size() != 7){
        //                 player1.push(hn[i]);
        //             }
        //             if(player2.size() != 7){
        //                 player2.push(hn[i+7]);
        //             }
        //             if(player3.size() != 7){
        //                 player3.push(hn[i+14]);
        //             }
        //             if(player4.size() != 7){
        //                 player4.push(hn[i+21]);
        //             }
        //             if(grounddeck.size() != 80){
        //                 grounddeck.push(hn[i+28]);
        //             }
                    
        //         }
                
        //         console.log('player1');
        //         console.log(player1);

        //         console.log('player2');
        //         console.log(player2);

        //         console.log('player3');
        //         console.log(player3);
                
        //         console.log('player4');
        //         console.log(player4);

        //         console.log('gronunddeck')
        //         console.log(grounddeck);
        //     });
            
        // });
    }
}


// class Stack {
//     constructor(){
//         this.items = []
//         this.count = 0
//     }

//     push(element){
//         this.items[this.count] = element
//         console.log(`${element} added to ${this.count} `)
//         this.count++
//         return this.count-1
//     }
//     size(){
//         return this.count
//     }
//     length(){ 
//         return this.count = 7
//     }
    
// }

module.exports = GameDeckCard;




    


const ActiveRecord = require('./ActiveRecord');
//const Card = require('../models/card');

var base_Deck = require('../models/card')

class BaseDeck extends ActiveRecord {

    static table_name = "Base Deck";
    static fields = ['id','value','color'];
    

    static getDeck = function() {
        return new Promise((resolve, reject) => {
            BaseDeck.all().then((deck) => {
               
               
               //USer Card 
               console.log('User Card');
                console.log(deck[0]);
               
               
               
               //Reference Card 
               const deckk = new base_Deck();
               deckk.shuffle()
               console.log('Referenced Card');
               console.log(deckk.cards)
               
                resolve(deck); // Returns whatever value is in parentheses

            });
            
        })
    }

}

module.exports = BaseDeck;

const ActiveRecord = require('./ActiveRecord');


class BaseDeckCard extends ActiveRecord {
    static table_name = "Base Deck";
    static fields = ['id', 'value', 'color'];

    static COLORS = ['Blue','Green','Red','Yellow', 'Black'];

    // Special card constant values
    static SKIP = 10;
    static REVERSE = 11;
    static DRAW2 = 12;
    static WILD = 13;
    static WILDDRAW4 = 14;

    static VALUES = [ '0','1','2','3','4','5','6','7', '8', '9', '10', '11', '12', '13', '14']; 


    #id = undefined;
    #color = undefined;
    #value = undefined;

    constructor (id, color, value){ 
        this.#id = id;
        this.#color= col; 
        this.#value = val; 
    }
    
    static getDeck = function () {
        return new Promise((resolve, reject) => {
            BaseDeck.all().then((baseDeckData) => {

                baseDeck = [];

                for(let cardData of baseDeckData) {

                    let card = new Card(cardData.id, cardData.color, cardData.value);

                    baseDeck.push(card);
                }

                resolve(baseDeck); 
            });

        })
    }

}

module.exports = BaseDeckCard;

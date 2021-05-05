
//Total Cards: 108
//Blue Cards: 19
//Green Cards: 19
//Red Cards: 19,
//Yellow Cards: 19
//Skip Cards: 8 
//Reverse Cards: 8
// Draw Two Cards:8
//Wild Cards: 4
//Wild Draw 4 Cards: 4

//Num of players
//Discard Pile





class BaseDeck { 

    #cards = [];

    constructor(baseDeckData){ 

        // Iterate over baseDeckData and create Card objects
        for(let cardData of baseDeckData) {
            let card = new Card(cardData.id, cardData.color, cardData.value);

            // Add Card object to cards array
            this.#cards.push(card);
        }
    }
    
    get deck() {
        return this.#cards;
    }

    get numofCards(){ 
        return this.#cards.length;
    }
    shuffle(){ 
        for(let i = this.numofCards -1; i > 0; i -- ){ 

            const newIndex = Math.floor(Math.random()* (i+1)); //Math.floor for Integer
            const oldVal = this.#cards[newIndex];
            this.#cards[newIndex] = this.#cards[i];
            this.#cards[i] = oldVal;
        }
    }

}

class Card{ 

    id = undefined;
    color = undefined;
    value = undefined;

    constructor (id, color, value){ 
        this.id = id;
        this.color= color; 
        this.value = value; 
    }

}


// function freshDeck(){ 
//     //flatmap combines Array  of arrays  
//     return color.flatMap(col=> { 
        
//         return VALUES.map(val=> { 
          
//             return new Card(col, val)
//         })
//     })

// }



module.exports = Card;
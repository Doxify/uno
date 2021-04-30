
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

const color = ['Blue','Green','Red','Yellow'];
const WildCards = ['Skip','Reverse','Draw2Cards', 'WildCards', 'WildDraw4']
const VALUES = [ '1','2','3','4','5','6','7']; 



 class base_Deck{ 
    constructor(cards = freshDeck()){ 
        this.cards = cards; 
    }
     
    get numofCards(){ 
        return this.cards.length
    }
    shuffle(){ 
        for(let i = this.numofCards -1; i > 0; i -- ){ 

            const newIndex = Math.floor(Math.random()* (i+1)) //Math.floor for Integer
            const oldVal = this.cards[newIndex]
            this.cards[newIndex] = this.cards[i];
            this.cards[i] = oldVal
        }
    }

}

class Card{ 
    constructor (col, val){ 
        this.color= col; 
        this.value = val; 
    }

}


function freshDeck(){ 
    //flatmap combines Array  of arrays  
    return color.flatMap(col=> { 
        
        return VALUES.map(val=> { 
          
            return new Card(col, val)
        })
    })

}



module.exports = base_Deck;
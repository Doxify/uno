const ActiveRecord = require('./ActiveRecord');
var base_Deck = require('../models/card');
const { func } = require('./connection');
const { get } = require('../routes');

class CreateGameDeck extends ActiveRecord{
    static table_name = "Base Deck";
    static fields = ['id','value','color'];
    static getDeckk = function() {
        
        return new Promise((resolve, reject) => {
            CreateGameDeck.all().then((deckk) => {
                
                const newdeck = new base_Deck();
                newdeck.shuffle()
                console.log('new deck');
                console.log(newdeck.cards);
                var hn = newdeck.cards;
                
                const grounddeck = new Stack();
                const player1 = new Stack();
                const player2 = new Stack();
                const player3 = new Stack();
                const player4 = new Stack();

                for(let i=0; i<108; i++)
                {
                    if(player1.size() != 7){
                        player1.push(hn[i]);
                    }
                    if(player2.size() != 7){
                        player2.push(hn[i+7]);
                    }
                    if(player3.size() != 7){
                        player3.push(hn[i+14]);
                    }
                    if(player4.size() != 7){
                        player4.push(hn[i+21]);
                    }
                    if(grounddeck.size() != 80){
                        grounddeck.push(hn[i+28]);
                    }
                    
                }
                
                console.log('player1');
                console.log(player1);

                console.log('player2');
                console.log(player2);

                console.log('player3');
                console.log(player3);
                
                console.log('player4');
                console.log(player4);

                console.log('gronunddeck')
                console.log(grounddeck);






            });
            
        })
    
    
    
    }
}
class Stack {
    constructor(){
        this.items = []
        this.count = 0
    }

    push(element){
        this.items[this.count] = element
        console.log(`${element} added to ${this.count} `)
        this.count++
        return this.count-1
    }
    size(){
        return this.count
    }
    length(){ 
        return this.count = 7
    }
    
}

module.exports = CreateGameDeck;




    


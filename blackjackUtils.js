function createDeck() {
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const deck = [];
    for (const value of values) {
        for (let i = 0; i < 4; i++) {
            deck.push({ value });
        }
    }
    return deck;
}
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}
function drawCard(deck) {
    return deck.pop();
}
function calculateHandValue(hand) {
    let value = 0;
    hand.forEach(card => {
        value += parseInt(card.value, 10);
    });
    return value;
}
function getCardName(card) {
    return `${card.value}`;
}
module.exports = { createDeck, shuffleDeck, drawCard, calculateHandValue, getCardName };

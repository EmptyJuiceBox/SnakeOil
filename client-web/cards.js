"use strict";

var events_callers = events_callers || {};

var cards_hand = {};
var cards_container = null;

document.addEventListener(
    "DOMContentLoaded",
    function()
    {
        cards_container = document.getElementById("cards-container");
    },
    false
);

window.cards_new = function(id, text)
{
    var carddiv = document.createElement("div");
    var cardpar = document.createElement("p");
    cardpar.textContent = text;
    carddiv.id = "card-" + id;
    carddiv.appendChild(cardpar);
    cards_container.appendChild(carddiv);
}

window.cards_del = function(id)
{
    var carddiv = cards_container.getElementById("card-" + id);
    cards_container.removeChild(carddiv);
}

events_callers.hand = function(cards)
{
    api_get("hand", cards_hand_handler);
}

window.cards_hand_handler = function(cards)
{
    for (id in cards_hand)
    {
        text = cards_hand[id];

        if (cards[id] !== text)
            cards_del(id);
    }

    for (id in cards)
    {
        text = cards[id];

        if (cards_hand[id] !== text)
            cards_new(id, text);
    }
}


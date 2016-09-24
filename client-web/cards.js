"use strict";

var events_callers = events_callers || {};

var cards_hand = {};
var cards_container = null;

document.addEventListener(
    "DOMContentLoaded",
    function()
    {
        cards_container = document.getElementById("cards-container");
        cards_new(1, "truck");
        cards_new(2, "cat");
        cards_new(3, "dog");
    },
    false
);

window.cards_new = function(id, text)
{
    var carddiv = document.createElement("div");
    var cardpar = document.createElement("p");

    cardpar.textContent = text;

    carddiv.id = "card-" + id;
    carddiv.className = "card";
    carddiv.appendChild(cardpar);

    carddiv.onclick = function () { pitch_select(id) };

    cards_container.appendChild(carddiv);

    cards_hand[id] = text;
}

window.cards_del = function(id)
{
    var carddiv = document.getElementById("card-" + id);
    cards_container.removeChild(carddiv);

    delete cards_hand[id]
}

events_callers.hand = function(cards)
{
    api_get("hand", cards_hand_handler);
}

window.cards_hand_handler = function(cards)
{
    var id;
    
    for (id in cards_hand)
    {
        var text = cards_hand[id];

        if (cards[id] !== text)
            cards_del(id);
    }

    for (id in cards)
    {
        var text = cards[id];

        if (cards_hand[id] !== text)
            cards_new(id, text);
    }
}


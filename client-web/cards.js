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
    var colours = ["red", "yellow", "blue", "green", "purple"];

    var colourindex = text.split("")
        .reduce(function(a, c){return a + c.charCodeAt(0)}, 0);

    cardpar.textContent = text;

    carddiv.id = "card-" + id;
    carddiv.className = "card card-" + colours[colourindex % colours.length];
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
    api_seq_get("hand", cards_hand_handler);
}

window.cards_hand_handler = function(cards)
{
    var id;
    var clear_product = false;

    for (id in cards_hand)
    {
        var text = cards_hand[id];

        if (cards[id] !== text)
        {
            clear_product = true;
            cards_del(id);
        }
    }

    for (id in cards)
    {
        var text = cards[id];

        if (cards_hand[id] !== text)
        {
            clear_product = true;
            cards_new(id, text);
        }
    }

    if (clear_product)
        pitch_clear();
}


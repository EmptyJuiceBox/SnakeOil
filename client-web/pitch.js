"use strict";

var events_callers = events_callers || {};

var pitch_selected = [];
var pitch_timeout  = null;
var pitch_timer_intervalid = null;
var pitch_begun  = false;

var pitch_timer_span    = null;
var pitch_reveal_button = null;
var pitch_self_product  = null;
var pitch_button        = null;

var pitch_selectable = true;

if (!Date.now)
{
    Date.now = function() { return new Date().getTime(); }
}

document.addEventListener(
    "DOMContentLoaded",
    function()
    {
        pitch_self_product  = document.getElementById("self-product");
        pitch_button        = document.getElementById("pitch-button");
        pitch_reveal_button = document.getElementById("reveal-button");
        pitch_timer_span    = document.getElementById("pitch-timer");

        pitch_button.addEventListener(
            "click",
            events_callers.pitch_start,
            false
        );

        pitch_reveal_button.addEventListener(
            "click",
            events_callers.pitch_reveal,
            false
        );
    },
    false
);

window.pitch_select_new = function(cardid)
{
    var carddiv = document.getElementById("card-" + cardid);
    carddiv.className += " card-selected";
}

window.pitch_select_del = function(cardid)
{
    var carddiv = document.getElementById("card-" + cardid);
    carddiv.className = carddiv.className.replace(" card-selected", "");
}

window.pitch_select = function(cardid)
{
    if (pitch_selected.indexOf(cardid) > 0 || ! pitch_selectable)
        return;

    if (pitch_selected.length === 2)
        pitch_select_del(pitch_selected.shift());

    pitch_selected.push(cardid);
    pitch_select_new(cardid);
    pitch_self_display();
}

window.pitch_self_display = function()
{
    var names = pitch_selected.map(function(id) { return cards_hand[id]; });
    pitch_self_product.textContent = names.join(" ");
}

window.pitch_update_timer = function()
{
    var remaining = Math.round((pitch_timeout - Date.now()) / 1000) ;
    pitch_timer_span.textContent =
        remaining + " seconds left for your pitch ...";

    if (remaining <= 0)
        clearInterval(pitch_timer_intervalid);
}

window.pitch_end = function()
{
    clearInterval(pitch_timer_intervalid);
    pitch_timer_intervalid = null;
    pitch_timer_span.style.display    = "none";
    pitch_reveal_button.style.display = "none";
    pitch_selectable = true;
    pitch_begun = false;

    api_post("pitch-end", pitch_end_handler);
}

window.pitch_end_handler = function(data)
{
    pitch_selected = [];
}

events_callers.pitch_start = function()
{
    if (pitch_selected.length !== 2)
        throw error_new("Select some cards first");

    pitch_reveal_button.style.display = "inline-block";

    pitch_selectable = false;

    api_post(
        "pitch-start",
        {"cards": pitch_selected},
        pitch_start_handler
    );
}

window.pitch_start_handler = function(data)
{
    pitch_begun = true;
    pitch_timeout = Date.now() + data.time;
    pitch_timer_span.style.display    = "inline-block";
    pitch_timer_intervalid = setInterval(pitch_update_timer, 1000);
}

window.pitch_pitcher_turn = function()
{
    if (! pitch_begun)
        pitch_button.style.display = "inline-block";
}

window.pitch_customer_turn = function()
{
    var playernodes = players_container.childNodes;

    for (i=0; i < playernodes.length; i++)
    {
        var node = playernodes[i];

        if (node.nodeType !== 1 ||
            node.className.indexOf("player-selectable") !== 0)
            continue;

        node.className += " player-selectable";

        var nodeId = node.id.split("-")[1];

        node.addEventListener(
            "click",
            function()
            {
                if (pitch_selected !== null)
                {
                    var prev =
                        document.getElementById("player-" + pitch_selected);
                    prev.className =
                        prev.className.replace(" player-selected", "");
                }

                node.className += " player-selected";
                pitch_selected = nodeId;
            },
            false
        );
    }
}

events_callers.reveal = function()
{
    pitch_reveal_button.style.display = "inline-block";
    api_post("reveal", null, null);
}

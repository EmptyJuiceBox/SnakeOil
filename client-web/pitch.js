"use strict";

var events_callers = events_callers || {};

var pitch_selected = [];
var pitch_timeout  = null;
var pitch_timer_intervalid = null;

var pitch_self_product = null;

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

document.addEventListener(
    "DOMContentLoaded",
    function()
    {
        pitch_self_product = document.getElementById("self-product");
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
    if (pitch_selected.indexOf(cardid) > 0)
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
    var remaining = Date.now() - pitch_timeout;
}

window.pitch_end = function()
{
    clearInterval(pitch_timer_intervalid);
    pitch_timer_intervalid = null;
    response = api_post("pitch-end", pitch_end_handler);
}

window.pitch_end_handler = function(data)
{
    pitch_selected = [];
}

window.pitch_start = function()
{
    if (pitch_selected.length !== 2)
        throw error_user("Select some cards first");

    api_post(
        "pitch-start",
        {"cards": pitch_selected},
        pitch_start_handle
    );
}

window.pitch_start_handle = function(data)
{
    pitch_timeout = Date.now() + data.time;
    pitch_timer_intervalid = setInterval(pitch_update_timer, 1000);
}

window.pitch_reveal = function()
{
    api_post("reveal", null);
}

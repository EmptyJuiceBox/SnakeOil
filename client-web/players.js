"use strict";

events_callers = events_callers || {};
console.log(events_callers);
var players_container = null;

var players_pitcher = null;
var players_customer = null;
var players_profession = null;
var players_me = null;

document.addEventListener(
    "DOMContentLoaded",
    function()
    {
        players_container = document.getElementById("players-container");
    },
    false
);

window.players_update = function(playerid, name, score, pitch)
{
    var playerdiv = document.getElementById("player-" + playerid);
    var namespan, scorespan, pitchspan;

    if (playerdiv === null)
    {
        playerdiv = document.createElement("div");
        namespan  = document.createElement("span");
        scorespan = document.createElement("span");
        pitchspan = document.createElement("span");

        namespan.className  = "name";
        scorespan.className = "score";
        pitchspan.className = "pitch";

        playerdiv.appendChild(namespan);
        playerdiv.appendChild(scorespan);
        playerdiv.appendChild(pitchspan);

        players_container.appendChild(playerdiv);
    }
    else
    {
        playerdiv.forEach(
            function (n) { if (n.className ==  "name")  namespan = n }
        );

        playerdiv.forEach(
            function (n) { if (n.className == "score") scorespan = n }
        );

        playerdiv.forEach(
            function (n) { if (n.className == "pitch") pitchspan = n }
        );

    }

    namespan.textContent  = name;
    scorespan.textContent = score;
    pitchspan.textContent = pitch;

    players_scores[playerid] = score;
    players_names[playerid]  = name;
}

window.players_del = function(playerid)
{
    var playerdiv = document.getElementById("player-" + playerid);
    players_container.removeChild(playerdiv);
}

events_callers.register = function()
{
    var name = prompt("Enter a nickname ...");

    api_get(
        "register",
        {"name": name},
        players_register_handler
    );
}

window.players_register_handler = function(data)
{
    console.log("Playing with player id " + data.id);
    players_me = data.id;
}

events_callers.players = function(name)
{
    api_get("players", null, players_players_handler);
}

window.players_players_handler = function(data)
{
    for (id in data)
    {
        var player = data[id];
        players_update(id, player.name, player.score, player.pitch);
    }
}

events_callers.roles = function(name)
{
    api_get("roles", null, players_roles_handler);
}

window.players_roles_handler = function(data)
{
    players_customer   = data.customer;
    players_pitcher    = data.pitcher;
    players_profession = data.profession;

    if (players_pitcher === players_me)
        pitch_turn();
}

"use strict";

events_callers = events_callers || {};

var players_container = null;

var players_pitcher = null;
var players_customer = null;
var players_profession = null;

var players_me = null;
var players_token = null;

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
    console.log([playerid, name, score, pitch]);

    if (playerdiv === null)
    {
        playerdiv = document.createElement("div");
        playerdiv.id = "player-" + playerid;
        playerdiv.className = "player";

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
        playerdiv.childNodes.forEach(
            function (n) { if (n.className ==  "name")  namespan = n }
        );

        playerdiv.childNodes.forEach(
            function (n) { if (n.className == "score") scorespan = n }
        );

        playerdiv.childNodes.forEach(
            function (n) { if (n.className == "pitch") pitchspan = n }
        );

    }

    namespan.textContent  = name;
    scorespan.textContent = score;
    pitchspan.textContent = pitch;
}

window.players_del = function(playerid)
{
    var playerdiv = document.getElementById("player-" + playerid);
    players_container.removeChild(playerdiv);
}

events_callers.players = function()
{
    api_get("players", players_players_handler);
}

window.players_players_handler = function(data)
{
    console.log(data);
    
    for (var id in data)
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

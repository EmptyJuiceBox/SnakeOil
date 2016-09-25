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
    var namespan, scorespan, statespan;
    var state;

    if (playerdiv === null)
    {
        playerdiv = document.createElement("div");
        playerdiv.id = "player-" + playerid;
        playerdiv.className = "player";

        namespan  = document.createElement("span");
        scorespan = document.createElement("span");
        statespan = document.createElement("span");

        namespan.className  = "name";
        scorespan.className = "score";
        statespan.className = "state";

        playerdiv.appendChild(namespan);
        playerdiv.appendChild(scorespan);
        playerdiv.appendChild(statespan);

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
            function (n) { if (n.className == "state") statespan = n }
        );

    }

    namespan.textContent  = name;
    scorespan.textContent = score;

    if (name === players_pitcher)
    {
        if (pitch === null)
            state = "Currently making a pitch ...";

        else
            state = "Currently pitching " + pitch;
    }
    else if (name === players_customer)
    {
        state = "Our " + players_profession + " customer";
    }
    else if (pitch !== null)
    {
        state = "Already pitched " + pitch;
    }
    else
    {
        state = "";
    }

    statespan.textContent = state;
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
    for (var id in data)
    {
        var player = data[id];
        players_update(id, player.name, player.score, player.pitch);
    }

    var playernodes = players_container.childNodes;

    for (i=0; i < playernodes.length; i++)
    {
        console.log(playernodes[i]);
        var node = playernodes[i].id;
        var nodeId = node.split("-")[1];

        if (data[nodeId] == null)
            players_container.removeChild(node);
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

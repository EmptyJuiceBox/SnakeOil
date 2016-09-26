"use strict";

events_callers = events_callers || {};

var players_container = null;

var players_pitcher = null;
var players_customer = null;
var players_profession = null;
var players_pitch_started = false;
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

    if (playerid === players_pitcher)
    {
        if (pitch === null && ! players_pitch_started)
            state = "About to make a pitch ...";

        else if (pitch == null)
            state = "Currently making a pitch ...";

        else
            state = "Currently pitching " + pitch;
    }
    else if (playerid === players_customer)
    {
        state = "Customer - " + players_profession;
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
    api_seq_get("players", players_players_handler);
}

window.players_players_handler = function(data)
{
    console.log(data);

    for (var id in data)
    {
        var player = data[id];
        console.log(player);
        players_update(id, player.name, player.score, player.pitch);
    }

    var playernodes = players_container.childNodes;

    for (i=0; i < playernodes.length; i++)
    {
        var node = playernodes[i];

        if (node.nodeType !== 1)
            continue;

        var nodeId = node.id.split("-")[1];

        if (data[nodeId] == null)
            players_container.removeChild(node);
    }
}

events_callers.roles = function(name)
{
    api_get("roles", players_roles_handler);
}

window.players_roles_handler = function(data)
{
    console.log("ROLES");
    console.log(data);
    players_customer   = data.customer;
    players_pitcher    = data.pitcher;
    players_profession = data.profession;
    players_pitch_started = data.pitch_started;

    if (players_pitcher === players_me)
        pitch_pitcher_turn();

    if (players_pitcher === null && players_customer === players_me)
        pitch_customer_turn();

    else
        pitch_chosen = null;

}

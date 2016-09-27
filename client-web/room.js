var room_cardpacks_list;
var room_name_input;
var room_id_input;
var room_ui;
var room_game_ui;

var room_id;
var room_name;

var room_id_span;
var room_name_span;

var room_cardnum_input;
var room_pitchtime_input;

document.addEventListener(
    "DOMContentLoaded",
    function()
    {
        room_cardpacks_list  = document.getElementById("cardpack-container");
        room_name_input      = document.getElementById("new-room-name");
        room_cardnum_input   = document.getElementById("new-room-cardnum");
        room_pitchtime_input = document.getElementById("new-room-pitchtime");
        room_id_input        = document.getElementById("room-join-id");
        room_ui              = document.getElementById("room-ui");
        room_game_ui         = document.getElementById("game-ui");
        room_id_span         = document.getElementById("room-id");
        room_share_input     = document.getElementById("room-share");
        room_name_span       = document.getElementById("room-name");

        events_callers.register();

        document.getElementById("new-room-ui").addEventListener(
            "submit",
            function(e)
            {
                e.preventDefault();
                events_callers.room_create();
            },
            false
        );

        document.getElementById("join-room-ui").addEventListener(
            "submit",
            function(e)
            {
                e.preventDefault();
                events_callers.room_join();
            },
            false
        );

        document.getElementById("room-leave-button").addEventListener(
            "click",
            events_callers.room_leave,
            false
        );
    },
    false
);

events_callers.cardpacks = function()
{
    api_get("cardpacks", room_cardpacks_handler);
}

window.room_cardpacks_handler = function(data)
{
    for (i=0; i < data.length; i++)
    {
        var packopt = document.createElement("option");
        packopt.textContent = data[i];
        packopt.value       = data[i];
        room_cardpacks_list.appendChild(packopt);
    }
}

events_callers.register = function()
{
    var name = prompt("Enter a nickname ...");

    while (! name)
        name = prompt("Enter a nickname properly this time ...");

    api_post(
        "register",
        {"name": name},
        room_register_handler
    );
}

window.room_register_handler = function(data)
{
    players_me    = data.id;
    players_token = data.token;
    events_poll();

    // People should be able to share links to rooms by adding a hash
    // with the room ID to the URL.
    if (location.hash)
    {
        room_id_input.value = location.hash.substring(1);
        events_callers.room_join();
        location.hash = "";
    }
}

events_callers.room_join = function()
{
    var id = room_id_input.value.trim();

    api_seq_post("room_join", {"id": id}, room_room_join_handler);
}

window.room_room_join_handler = function(data)
{
}

events_callers.room_leave = function()
{
    api_get("room_leave", room_leave_handler);
}

window.room_leave_handler = function()
{
    room_id = null;
    room_name = null;

    room_ui.style.display      = "block";
    room_game_ui.style.display = "none";
}

events_callers.room = function()
{
    api_seq_get("room", room_room_handler);
}

window.room_room_handler = function(data)
{
    if (data === null)
        room_leave_handler();

    room_id   = data.id;
    room_name = data.name;

    room_ui.style.display      = "none";
    room_game_ui.style.display = "block";

    room_id_span.textContent   = "ID: " + room_id;
    room_share_input.value     = location.href.replace("#", "") + "#"+room_id;
    room_name_span.textContent = room_name;
}

events_callers.room_create = function()
{
    var name      = room_name_input.value;
    var packs     = room_cardpacks_list.selectedOptions;
    var cardnum   = room_cardnum_input.value;
    var pitchtime = room_pitchtime_input.value;
    var packnames = [];

    if (packs.length === 0)
        throw error_new("You must select at least one cardpack for your game");

    if (! name)
        throw error_new("You must name your new game");

    for (i=0; i < packs.length; i++)
        packnames.push(packs[i].value);

    api_seq_post(
        "room_create",
        {
            "name": name,
            "cardpacks": packnames,
            "pitch_duration": pitchtime,
            "cards_per_player": cardnum
        },
        room_room_create_handler
    );
}

window.room_room_create_handler = function(data)
{
}


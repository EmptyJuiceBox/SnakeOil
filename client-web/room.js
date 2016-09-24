var room_cardpacks_list;
var room_name_input;
var room_id_input;
var room_ui;
var room_game_ui;

var room_id;
var room_name;

var room_id_span;
var room_name_span;

document.addEventListener(
    "DOMContentLoaded",
    function()
    {
        room_cardpacks_list = document.getElementById("cardpack-container");
        room_name_input     = document.getElementById("new-room-name");
        room_id_input       = document.getElementById("room-join-id");
        room_ui             = document.getElementById("room-ui");
        room_game_ui        = document.getElementById("game-ui");
        room_id_span        = document.getElementById("room-id");

        events_callers.register();

        document.getElementById("new-room-button").onclick =
            events_callers.room_create

        document.getElementById("join-room-button").onclick =
            events_callers.room_join

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

    api_post(
        "register",
        {"name": name},
        room_register_handler
    );
}

window.room_register_handler = function(data)
{
    console.log("Playing with player id " + data.id);
    console.log(data);
    players_me    = data.id;
    players_token = data.token;
    events_poll();
}

events_callers.room_join = function()
{
    var id = parseInt(room_id_input.value);

    api_post("room_join", {"id": id}, room_room_join_handler);
}

window.room_room_join_handler = function(data)
{
    room_enter();
}

events_callers.room = function()
{
    api_get("room", room_room_handler);
}

window.room_room_handler = function(data)
{
    room_id   = data.id;
    room_name = data.name;

    room_ui.style.display      = "none";
    room_game_ui.style.display = "block";

    room_id_span.textContent   = room_id;
}

events_callers.room_create = function()
{
    var name = room_name_input.value;
    var packs = room_cardpacks_list.selectedOptions;
    var packnames = [];

    if (packs.length === 0)
        throw error_new("You must select at least one cardpack for your room");

    if (! name)
        throw error_new("You must name your new room");

    for (i=0; i < packs.length; i++)
        packnames.push(packs[i].value);

    api_post(
        "room_create",
        {"name": name, "cardpacks": packnames},
        room_room_create_handler
    );
}

window.room_room_create_handler = function(data)
{
}


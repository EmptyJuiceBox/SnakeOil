var room_cardpacks_container;

document.addEventListener(
    "DOMContentLoaded",
    function()
    {
        room_cardpacks_container =
            document.getElementById("cardpack-container");
        events_callers.register()
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
        var packdiv = document.createElement("div");
        packdiv.textContent = data[i];
        room_cardpacks_container.appendChild(packdiv);
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
}

events_callers.room_join = function()
{
    var id = prompt("Enter room id ...");

    api_post("room_join", {"id": id}, room_room_join_handler);
}

window.room_room_join_handler = function(data)
{
}

events_callers.room_create = function()
{
    var name = prompt("Enter name for room ...");
    var packs = prompt("Enter card packs for room ...");

    packs = packs.split(" ");

    api_post(
        "room_create",
        {"name": name, "cardpacks": packs},
        room_room_create_handler
    );
}

window.room_room_create_handler = function(data)
{
}


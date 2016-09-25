var events_callers = events_callers || {};

window.events_poll = function()
{
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "/event", true);
    xhr.overrideMimeType("text/json");

    xhr.timeout = 5000;

    xhr.setRequestHeader("Session-Id", players_me);
    xhr.setRequestHeader("Session-Token", players_token);

    xhr.send(null);

    xhr.addEventListener(
        "load",
        function()
        {
            var json = JSON.parse(xhr.responseText);

            if (json.err)
                throw error_new(json.err);

            for (i=0; i < json.data.length; i++)
            {
                console.log(json.data[i]);
                events_callers[json.data[i].replace("/", "")]();
            }

            events_poll();
        }
    );

    xhr.addEventListener("timeout", events_poll);
}

events_callers.heartbeat = function()
{
    api_post("heartbeat", "{}", null);
}

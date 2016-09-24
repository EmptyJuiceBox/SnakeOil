var events_callers = events_callers || {};

window.events_poll = function()
{
    var xhr = new XMLHttpRequest();

    console.log("POLLIN'");

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
            console.log(xhr.responseText);
            var json = JSON.parse(xhr.responseText);
            console.log(json);

            if (json.err)
                throw error_new(json.err);

            for (i=0; i < json.data.length; i++)
            {
                events_callers[json.data[i].replace("/", "")]();
                console.log("POLLED "+ json.data[i]);
            }

            events_poll();
        }
    );

    xhr.addEventListener("timeout", events_poll);
}

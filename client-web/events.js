var events_callers = events_callers || {};

window.events_poll = function()
{
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "events", true);

    xhr.timeout = 5000;

    xhr.addEventListener(
        "load",
        function()
        {
            var json = JSON.parse(xhr.responseText);

            if (json.err)
                throw error_new(json.err);

            for (i=0; i < json.paths.length; i++)
                events_callers[json.paths[i]]();

            events_poll();
        }
    );

    xhr.addEventListener("timeout", events_poll);
}

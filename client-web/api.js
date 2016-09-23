"use strict";

window.api_request = function(method, path, body, cb)
{
    var xhr = new XMLHttpRequest();

    xhr.open(method, "http://localhost:8080/" + path);
    xhr.overrideMimeType("text/json");
    xhr.send(body);

    xhr.addEventListener(
        "load",
        function()
        {
            var json = JSON.parse(xhr.responseText);

            if (json.err)
                throw error_new(json.err);

            if (cb)
                cb(JSON.parse(xhr.responseText));
        }
    );

    xhr.addEventListener(
        "abort",
        function()
        {
            throw error_new("Request aborted");
        }
    );

    xhr.addEventListener(
        "error",
        function()
        {
            throw error_new("Request errored");
        }
    );

    return xhr;
}

window.api_get = function(path, cb)
{
    return api_request("GET", path, null, cb);
}

window.api_post = function(path, body, cb)
{
    var json = JSON.stringify(body);

    return api_request("POST", path, json, cb);
}

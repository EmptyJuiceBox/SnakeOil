"use strict";

window.api_request = function(method, path, body, cb)
{
    var xhr = new XMLHttpRequest();

    xhr.open(method, path);
    xhr.overrideMimeType("text/json");
    xhr.send(body);

    xhr.addEventListener(
        "load",
        function()
        {
            json = JSON.parse(xhr.responseText);

            if (json.err)
                throw err_new(json.err.msg);

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
    return request("GET", path, null, cb);
}

window.api_post = function(path, payload, cb)
{
    return request("POST", path, payload, cb);
}

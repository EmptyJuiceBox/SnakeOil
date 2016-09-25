"use strict";

window.api_request_raw = function(method, path, body, load, abort, err)
{
    var xhr = new XMLHttpRequest();

    xhr.open(method, "/" + path);
    xhr.overrideMimeType("text/json");

    if (players_me !== null)
        xhr.setRequestHeader("Session-Id", players_me);

    if (players_token !== null)
        xhr.setRequestHeader("Session-Token", players_token);

    xhr.send(body);

    xhr.addEventListener("load",  function(){ load(xhr);  });
    xhr.addEventListener("abort", function(){ abort(xhr); });
    xhr.addEventListener("error", function(){ error(xhr); });

    return xhr;
}

window.api_request = function(method, path, body, cb)
{
    var onload = function(xhr)
    {
        var json = JSON.parse(xhr.responseText);

        if (json.err)
            throw error_new(json.err);

        if (cb)
            cb(json.data);
    }

    var onabort = function(xhr)
    {
        throw error_new("Request aborted");
    }

    var onerror = function(xhr)
    {
        throw error_new("Request errored");
    }

    return api_request_raw(method, path, body, onload, onabort, onerror);
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

var api_seq_id    = 0;
var api_seq_order = [];
var api_seq_cb    = {};

window.api_seq_process = function()
{
    for(var i=0; i < api_seq_order.length; i++)
    {
        var id = api_seq_order[i];

        if (api_seq_data[id] !== undefined)
            api_seq_data[id]();

        else
            break;
    }
}

window.api_seq_request = function(method, path, body, cb)
{

    var onload = function(xhr)
    {
        var json = JSON.parse(xhr.responseText);

        if (json.err)
            throw error_new(json.err);

        if (cb)
        {
            var id = api_seq_id;
            api_seq_id++;
            api_seq_order.push(id);
            api_seq_data[id] = function(){cb(json.data)};
        }
    }

    var onabort = function(xhr)
    {
        throw error_new("Request aborted");
    }

    var onerror = function(xhr)
    {
        throw error_new("Request errored");
    }

    return api_request_raw(method, path, body, onload, onabort, onerror);
}

window.api_seq_get = function(path, cb)
{
    return api_request("GET", path, null, cb);
}

window.api_seq_post = function(path, body, cb)
{
    var json = JSON.stringify(body);

    return api_request("POST", path, json, cb);
}

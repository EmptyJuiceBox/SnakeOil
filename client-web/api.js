"use strict";

/*
 * Make an API request with specified callbacks.
 *
 * @param method (string) The HTTP method to use (GET, POST, ...)
 * @param path   (string) The path to request.
 * @param body   (string) The body to send with a POST request, null if empty.
 * @param load   (function) A callback success function.
 *               One argument - the XMLHttpRequest.
 * @param abort   (function) A callback for if the request is aborted.
 *               One argument - the XMLHttpRequest.
 * @param load   (function) A callback for if there is an error.
 *               One argument - the XMLHttpRequest.
 *
 * @return the XMLHttpRequest.
 */
window.api_request_raw = function(method, path, body, load, abort, error)
{
    console.log("> " + path + " <-- " + body);
    var xhr = new XMLHttpRequest();

    xhr.open(method, "/" + path);
    xhr.overrideMimeType("text/json");

    /* Send auth and session tokens if availible ... */
    if (players_me !== null)
        xhr.setRequestHeader("Session-Id", players_me);

    if (players_token !== null)
        xhr.setRequestHeader("Session-Token", players_token);

    xhr.send(body);

    /* Mount our callbacks */
    xhr.addEventListener("load",  function(){console.log("< " + path + " ->>" + xhr.responseText); load(xhr);  });
    xhr.addEventListener("abort", function(){ abort(xhr); });
    xhr.addEventListener("error", function(){ error(xhr); });

    return xhr;
}

/*
 * Make an API request. 
 *
 * @param method (string) The HTTP method to use (GET, POST, ...)
 * @param path   (string) The path to request.
 * @param body   (string) The body to send with a POST request, null if empty.
 * @param cb     (function) A callback, called on success with the data part of
 *               success response.
 *
 * @return The XMLHttpRequest.
 */
window.api_request = function(method, path, body, cb)
{
    var onload = function(xhr)
    {
        /* Parse the json... */
        var json = JSON.parse(xhr.responseText);

        /* Check we don't have an error ... */
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

/*
 * Make a POST request to the API with empty JSON as payload.
 *
 * @param path (string) The path to request.
 * @param cb   (function) A callback to call on success with the data payload
 *             returned by the server.
 *
 * @return The XMLHttpRequest.
 */
window.api_get = function(path, cb)
{
    return api_request("POST", path, "{}", cb);
}


/*
 * Make a POST request to the API with specified JSON as payload.
 *
 * @param path (string) The path to request.
 * @param body (object) An object to serialize as payload.
 * @param cb   (function) A callback to call on success with the data payload
 *             returned by the server.
 *
 * @return The XMLHttpRequest.
 */
window.api_post = function(path, body, cb)
{
    var json = JSON.stringify(body);

    return api_request("POST", path, json, cb);
}

/*
 * The api_seq system is designed to allow requests to be made asynchronously,
 * but their results to be evaluated in the correct sequence.
 */

/* The number of sequential events that have existed. Incremented so each has *
 * a unique ID.                                                               */
var api_seq_id    = 0;
/* A list of pending event IDs, in order they are to be evaluated. */
var api_seq_order = [];
/* A mapping of sequence IDs to callbacks. */
var api_seq_cb    = {};

/*
 * Process outstanding sequential events, where possible. 
 *
 * Events are processed from api_seq_order, until an event with no callback in
 * api_seq_cb is found.
 */
window.api_seq_process = function()
{
    for(var i=0; i < api_seq_order.length; i++)
    {
        var id = api_seq_order[i];

        if (api_seq_cb[id] !== undefined)
        {
            try
            {
                /* Do the callback */
                api_seq_cb[id]();
            }
            catch (err)
            {
                error_new(err);
            }
            /* Delete the event from the order and cbs */
            api_seq_order.splice(i, 1);
            delete api_seq_cb[id];
            /* If we delete an event, we need to decrement our lookup index. */
            i--;
        }

        else
            break;
    }
}

/* Process the api sequential events every 10 seconds, in case smthn breaks. */
setInterval(api_seq_process, 10000);

/*
 * Make a sequential request to the server.
 *
 * Identical to api_request, but cb is called in order.
 */
window.api_seq_request = function(method, path, body, cb)
{
    /* Get a unique id for this request */
    var id = api_seq_id;
    api_seq_id++;

    /* Append this to the end of the requests to be made */
    api_seq_order.push(id);

    var onload = function(xhr)
    {
        /* When this request returns, parse the returned json. */
        var json = JSON.parse(xhr.responseText);

        /* If it's an error, forget this event */
        if (json.err)
        {
            api_seq_order.splice(api_seq_order.indexOf(id), 1);
            throw error_new(json.err);
        }

        /* If we have a callback, put it in api_seq_cb. */
        if (cb)
            api_seq_cb[id] = function(){cb(json.data)};
        else
        /* If we don't use an empty function */
            api_seq_cb[id] = function(){};

        /* Process our sequence */
        api_seq_process();
    }

    /* If the request fails or aborts, remove this request from api_seq_order, *
     * so it doesn't hold up sucessful requests.                               */
    var onabort = function(xhr)
    {
        api_seq_order.splice(api_seq_order.indexOf(id), 1);
        throw error_new("Request aborted");
    }

    var onerror = function(xhr)
    {
        api_seq_order.splice(api_seq_order.indexOf(id), 1);
        throw error_new("Request errored");
    }

    return api_request_raw(method, path, body, onload, onabort, onerror);
}

/*
 * Make a sequential POST request to the API with empty JSON as payload.
 *
 * Identical to api_get, but cb is called in order.
 */
window.api_seq_get = function(path, cb)
{
    return api_seq_request("POST", path, "{}", cb);
}
/*
 * Make a sequential POST request to the API with specified JSON as payload.
 *
 * Identical to api_post, but cb is called in order.
 */
window.api_seq_post = function(path, body, cb)
{
    var json = JSON.stringify(body);

    return api_seq_request("POST", path, json, cb);
}

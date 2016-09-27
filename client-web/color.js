"use strict";

var colors = [ "red", "yellow", "blue", "green", "purple" ];

function color_from_string(str) {
    var colIndex = str.split("")
        .reduce(function(a, c) { return a + c.charCodeAt(0) }, 0);

    return "color-"+colors[colIndex % colors.length];
}

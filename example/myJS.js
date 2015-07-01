window.onload = function() {
    var mapDiv = d3.select("#map")
            .style({
                width: window.innerWidth*0.75+"px",
                height: window.innerHeight*0.75+"px"
            }),

        mapFill = d3.scale.linear()
            .range(["#fdd","#900"]);

    window.addEventListener("resize", function() {                              // added this to test dynamic map resizing
        mapDiv.style({
            width: window.innerWidth*0.75+"px",
            height: window.innerHeight*0.75+"px"
        });
    })

    d3.json('./us_states.json', function (error, json) {
        json = topojson.feature(json, json.objects.states);

        json.features = json.features
            .filter(function(d) { return d.id < 60; })                          // remove unwanted features
            .sort(function(a, b) { return d3.geo.area(a)-d3.geo.area(b); })     // sort features by geographic area

        mapFill.domain([0, json.features.length-1]);

        var map = avlminimap.Map()                                              // create map object
            .projection(d3.geo.albersUsa());                                    // set new map projection

        mapDiv.call(map);                                                       // add map to div container

        var layer = map.Layer()                                                 // create a new layer
            .data([json])                                                       // add the layer data
            .attr({fill: function(d, i) { return mapFill(i); }})                // add mapFill function to dynamically fill each state
            .on({click: click});                                                // add click event

        map.zoomToBounds(json)();                                               // zoom to bounds of entire json collection

        var clicked = null;
        function click(d) {
            if (clicked == d) {
                map.zoomToBounds(json).transition();                            // transition zoom to bounds of entire json collection
                clicked = null;
            }
            else {
                map.zoomToBounds(d).transition();                               // transition zoom to bounds of clicked state feature
                clicked = d;
            }
        }
    })
}

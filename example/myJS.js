window.onload = function() {
    var mapDiv = d3.select("#map")
            .style({
                width: window.innerWidth*0.75+"px",
                height: window.innerHeight*0.75+"px"
            }),
        mapDivNode = mapDiv.node(),

        mapFill = d3.scale.linear()
            .range(["#fdd","#900"]);

    window.addEventListener("resize", function() {
        mapDiv.style({
            width: window.innerWidth*0.75+"px",
            height: window.innerHeight*0.75+"px"
        });
    })

    d3.json('./us_states.json', function (error, json) {
        json = topojson.feature(json, json.objects.states);

        json.features = json.features
            .filter(function(d) { return d.id < 60; })
            .sort(function(a, b) { return d3.geo.area(a)-d3.geo.area(b); })

        mapFill.domain([0, json.features.length-1]);

        var map = avlminimap.Map()
            .projection(d3.geo.albersUsa());

        mapDiv.call(map);

        var layer = map.Layer()
            .data([json])
            .attr({fill: function(d, i) { return mapFill(i); }})
            .on({click: click});

        map.zoomToBounds(json)();

        var clicked = null;
        function click(d) {
            if (clicked == d) {
                map.zoomToBounds(json).transition();
                clicked = null;
            }
            else {
                map.zoomToBounds(d).transition();
                clicked = d;
            }
        }
    })
}

window.onload = function() {
	var menubar = avlmenu.Menubar();

	d3.select('#menubar').call(menubar);

	var dropdown = avlmenu.Dropdown()
		.data([{ text: 'Minimap Test' }]);

	menubar.append(dropdown);

	var mapDiv = d3.select("#map").style('height', window.innerHeight+'px'),
		mapDivNode = mapDiv.node();

	d3.json('./us_states.json', function (error, json) {
		json = topojson.feature(json, json.objects.states);

		json.features.forEach(function(d, i) {
			json.features[i].text = esc.fips2state(d.id);
		})

		json.features.sort(function(a,b) { return a.text < b.text ? -1 : 1; });

		var selector = avlmenu.Dropdown()
			.multi(true)
			.data(json.features);

	    dropdown.append(selector);

	    var map = avlminimap.Map()
	    	.width(mapDivNode.offsetWidth)
	    	.height(mapDivNode.offsetHeight-d3.select('#menubar').node().offsetHeight)
	    	.projection(d3.geo.albersUsa())
	    	.init(mapDiv);

	    var layer = map.Layer()
	    	.data([json])
	    	.attr({fill: '#900'});

	    map.zoomToBounds(json).draw();
	})
}

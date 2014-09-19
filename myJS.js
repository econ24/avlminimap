window.onload = function() {
	var menubar = avlmenu.Menubar();

	d3.select('#menu').call(menubar);

	var tab = avlmenu.Tab()
		.data([{ text: 'Popout', id: '#popout' },
			   { text: 'Zoom', id: '#zoom' },
			   { text: 'Zoomable', id: '#zoomable' },
			   { text: 'Canvas', id: '#canvas'} ]);

	menubar.append(tab);

	var popoutMap = avlminimap.Map()
		.width(window.innerWidth)
		.height(window.innerHeight-30);

	d3.select('#popout').call(popoutMap);

	var zoomMap = avlminimap.Map()
		.width(window.innerWidth)
		.height(window.innerHeight-30);

	d3.select('#zoom').call(zoomMap);

	var zoomableMap = avlminimap.ZoomMap()
		.width(window.innerWidth)
		.height(window.innerHeight-30);

	d3.select('#zoomable').call(zoomableMap);

	var canvasMap = avlminimap.CanvasMap()
		.width(window.innerWidth)
		.height(window.innerHeight-30);

	d3.select('#canvas').call(canvasMap);

	d3.json('./us_states.json', function(error, data) {
		var json = topojson.feature(data, data.objects.states);

		json.features.sort(function(a, b) { return d3.geo.area(a)-d3.geo.area(b); });

		var fill = d3.scale.linear()
			.domain([0, json.features.length/2, json.features.length-1])
			.range(['#008', '#ff8', '#800']);

		var popup = avlmenu.Popup()
			.text(function(d) { return [[esc.fips2state(d.id)], ['FIPS', d.id]]; })
			.bounds(d3.select("#popout"));

		var popoutLayer = popoutMap.Layer()
			.data([json])
			.onClick('popout', clicked)
			.styles({ fill: function(d, i) { return fill(i); }, stroke: '#300' })
			.call(popup);

		popoutMap
			.zoomToBounds(json)
			.append(popoutLayer);

		var fill = d3.scale.linear()
			.domain([0, json.features.length/2, json.features.length-1])
			.range(['#a2a', '#2a2', '#a20']);

		var popup = avlmenu.Popup()
			.text(function(d) { return [[esc.fips2state(d.id)], ['FIPS', d.id]]; })
			.bounds(d3.select("#zoom"));

		var zoomLayer = zoomMap.Layer()
			.data([json])
			.onClick('zoom', clicked)
			.styles({ fill: function(d, i) { return fill(i); }, stroke: '#300' })
			.call(popup);

		zoomMap
			.zoomToBounds(json)
			.append(zoomLayer);

		var popup = avlmenu.Popup()
			.text(function(d) { return [[esc.fips2state(d.id)], ['FIPS', d.id]]; })
			.bounds(d3.select("#zoomable"));

		var layer = zoomableMap.Layer()
			.data([json])
			.styles({ fill: function(d, i) { return fill(i); }, stroke: '#300' })
			.call(popup);

		zoomableMap
			.zoomToBounds(json)
			.append(layer);

		var fill = d3.scale.linear()
			.domain([0, json.features.length/2, json.features.length-1])
			.range(['#008', '#ff8', '#800']);

		var layer = canvasMap.Layer()
			.data([json])
			.styles({ fill: function(d, i) { return fill(i); }, stroke: '#300' });

		canvasMap
			.zoomToBounds(json)
			.append(layer);
	})

	function clicked(d) {
		console.log(d);
	}
}

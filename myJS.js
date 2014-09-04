window.onload = function() {
	var menubar = avlmenu.Menubar();

	d3.select('#menu').call(menubar);

	var tab = avlmenu.Tab()
		.data([{ text: 'Popout', id: '#popout' }, { text: 'Zoom', id: '#zoom' }]);

	menubar.append(tab);

	var popoutMap = avlminimap.Map()
		.width(window.innerWidth)
		.height(window.innerHeight-30);

	d3.select('#popout').append('svg')
		.call(popoutMap);

	var zoomMap = avlminimap.Map()
		.width(window.innerWidth)
		.height(window.innerHeight-30);

	d3.select('#zoom').append('svg')
		.call(zoomMap);

	d3.json('./us_states.json', function(error, data) {
		var json = topojson.feature(data, data.objects.states);

		json.features.sort(function(a, b) { return d3.geo.area(a)-d3.geo.area(b); });

		var fill = d3.scale.linear()
			.domain([0, json.features.length/2, json.features.length-1])
			.range(['#008', '#ff8', '#800']);

		var popoutLayer = avlminimap.Layer()
			.data([json])
			.onClick('popout', clicked)
			.styles({ fill: function(d, i) { return fill(i); }, stroke: '#300' });

		popoutMap
			.collection(popoutLayer.data())
			.zoomToBounds(json)
			.append(popoutLayer);

		var fill = d3.scale.linear()
			.domain([0, json.features.length/2, json.features.length-1])
			.range(['#a2a', '#2a2', '#a20']);

		var zoomLayer = avlminimap.Layer()
			.data([json])
			.onClick('zoom', clicked)
			.styles({ fill: function(d, i) { return fill(i); }, stroke: '#300' });

		zoomMap
			.collection(zoomLayer.data())
			.zoomToBounds(json)
			.append(zoomLayer);
	})

	function clicked(d) {
		console.log(d);
	}
}
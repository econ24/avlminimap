window.onload = function() {
	var menubar = avlmenu.Menubar();

	d3.select('#menu').call(menubar);

	var tab = avlmenu.Tab()
		.data([{ text: 'Popout', id: '#popout' }, { text: 'Zoom', id: '#zoom' }]);

	menubar.append(tab);

	var popoutMap = avlminimap2.Map()
		.width(window.innerWidth)
		.height(window.innerHeight-30);

	d3.select('#popout').append('svg')
		.call(popoutMap);

	var zoomMap = avlminimap2.Map()
		.width(window.innerWidth)
		.height(window.innerHeight-30);

	d3.select('#zoom').append('svg')
		.call(zoomMap);

	d3.json('./us_states.json', function(error, data) {
		var json = topojson.feature(data, data.objects.states);

		json.features.sort(function(a, b) { return d3.geo.area(a)-d3.geo.area(b); });

		var fill = d3.scale.linear()
			.domain([0, json.features.length-1])
			.range(['#fee', '#800'])

		var popoutLayer = avlminimap2.Layer()
			.data([json])
			.onClick('popout', clicked)
			.styles({ fill: function(d, i) { return fill(i); }, stroke: '#300' });

		popoutMap.append(popoutLayer);

		var zoomLayer = avlminimap2.Layer()
			.data([json])
			.onClick('zoom', clicked)
			.styles({ fill: function(d, i) { return fill(i); }, stroke: '#300' });

		zoomMap.append(zoomLayer);
	})

	function clicked(d) {
		console.log(this);
	}
}
var avlminimap = (function(){
	var minimap = {}

	var uniqueGroupID = 0,
	uniqueLayerID = 0;

	function createUniqueGroupID() {
		return 'group-'+uniqueGroupID++;
	}

	minimap.Map = function() {
		var svg,
			width = window.innerWidth,
			height = window.innerHeight,
			groups,
			paths,
			layerCache = {},
			projection = d3.geo.albers(),
			path = d3.geo.path().projection(projection);

		function map() {
		}

		map.init = function(selection, _svg_) {
			if (arguments.length) {
				svg = _svg_ || selection.append('svg')
								.attr('class', 'avl-minimap-map');
			}
			svg.attr('width', width)
				.attr('height', height);
			return map;
		}
		map.width = function(w) {
			if (!arguments.length) {
				return width;
			}
			width = w;
			if (svg) {
				map.init();
			}
			return map;
		}
		map.height = function(h) {
			if (!arguments.length) {
				return height;
			}
			height = h;
			if (svg) {
				map.init();
			}
			return map;
		}
		map.projection = function(p) {
			if (!arguments.length) {
				return projection;
			}
			projection = p;
			path.projection(p);
			return map;
		}
		map.path = function(p) {
			if (!arguments.length) {
				return path;
			}
			path = p;
			return map;
		}
		map.update = function() {
			paths.attr('d', path);
			return map;
		}
		map.transition = function() {
			paths.transition()
				.duration(250)
				.attr('d', path);
			return map;
		}
	    map.zoomToBounds = function(json) {
	        var bounds = path.bounds(json),
	            wdth = bounds[1][0] - bounds[0][0],
	            hght = bounds[1][1] - bounds[0][1],

	            k = Math.min(width/wdth, height/hght)*.95,
	            scale = projection.scale()*k;

	        var centroid = [(bounds[1][0]+bounds[0][0])/2, (bounds[1][1]+bounds[0][1])/2]//,
	            translate = projection.translate();

	        projection.scale(scale)
	        	.translate([translate[0]*k - centroid[0]*k + width / 2,
	                        translate[1]*k - centroid[1]*k + height / 2]);

	        return map;
	    }
	    map.Layer = function() {
	    	var layer = Layer(),
				id = createUniqueGroupID();

			layerCache[id] = layer;

			svg.append('g').attr('id', id)
				.attr('class', 'avl-minimap-group')
				.call(layer.init, map, id);

			groups = svg.selectAll('.avl-minimap-group');

			paths = groups.selectAll('path');

	    	return layer;
	    }
	    map.draw = function() {
			for (var id in layerCache) {
				layerCache[id].draw();
			}
	    }

		return map;
	}

	function Layer() {
		var data = [],
			groups,
			styles = {},
			attrs = {
				fill: 'none',
				stroke: '#000',
				'stroke-width': 1,
			  	'stroke-linejoin': 'round',
			  	'stroke-linecap': 'square'
  			},
			layerID,
			group,
			path;

		function layer() {
		}

		layer.init = function(selection, _map, id) {
			group = selection;
			path = _map.path();
			layerID = id;

			return layer;
		}
		layer.data = function(d) {
			if (!arguments.length) {
				return data;
			}
			data = d;
			groups = group.selectAll('g')
				.data(data, function() { return uniqueLayerID++; });

			groups.enter().append('g');

			groups.exit().remove();
			return layer;
		}
		layer.draw = function() {
			var paths = groups.selectAll('path')
				.data(function(d) { return d.features; });

			paths.enter().append('path')
				.attr('class', 'avl-minimap-path');
				
			paths.attr('d', path)
				.style(styles)
				.attr(attrs)
				console.log(attrs)
		}
		layer.style = function(s) {
			if (!arguments.length) {
				return styles;
			}
			for (var key in s) {
				styles[key] = s[key];
			}
			return layer;
		}
		layer.attr = function(a) {
			if (!arguments.length) {
				return attrs;
			}
			for (var key in a) {
				attrs[key] = a[key];
			}
			return layer;
		}

		return layer;
	}

	return minimap;
})()

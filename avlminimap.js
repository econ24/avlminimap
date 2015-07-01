var avlminimap = (function(){
	var minimap = {}

	var uniqueGroupID = 0,
	uniqueLayerID = 0;

	function createUniqueGroupID() {
		return 'group-'+uniqueGroupID++;
	}

	minimap.Map = function() {
		var selection,
			svg,
			width = window.innerWidth,
			height = window.innerHeight,
			layerCache = {},
			projection = d3.geo.albers(),
			path = d3.geo.path().projection(projection);

		function resize() {
			var oldWidth = width,
				oldHeight = height,

				div = selection.node();

			width = div.clientWidth;
			height = div.clientHeight;

			svg.attr({
				width: width,
				height: height
			});

			var translate = projection.translate();
			projection.translate([translate[0]-(oldWidth-width)/2, translate[1]-(oldHeight-height)/2]);
			map();
		}

		function map(select) {
			if (select) {
				selection = select;
				window.addEventListener("resize", resize);

				var div = selection.node();

				width = div.clientWidth;
				height = div.clientHeight;

				svg = selection.append('svg')
					.attr({
						class: 'avl-minimap-map',
						width: width,
						height: height
					});
				return;
			}
			for (var id in layerCache) {
				layerCache[id]();
			}
		}

		map.projection = function(p) {
			if (!arguments.length) {
				return projection;
			}
			projection = p;
			path.projection(p);
			map();
			return map;
		}
		map.path = function(p) {
			return path;
		}
		map.transition = function(duration) {
			duration = duration || 250;
			for (var id in layerCache) {
				layerCache[id].transition(duration);
			}
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
				.call(layer, map, id);

	    	return layer;
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
  			onFuncs = {},
			layerID,
			group,
			path;

		function layer(selection, _map_, id) {
			if (arguments.length == 3) {
				group = selection;
				map = _map_;
				path = map.path();
				layerID = id;
				return;
			}
			var paths = groups.selectAll('path')
				.data(function(d) { return d.features; });

			paths.enter().append('path')
				.attr('class', 'avl-minimap-path');

			paths.attr('d', path)
				.style(styles)
				.attr(attrs)
				.on(onFuncs);
		}
		layer.transition = function(duration) {
			groups.selectAll('path')
				.transition(duration || 250)
				.attr("d", path);
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
		/*
		These following functions (style, attr, on)
		accept an object of {attribute: value} pairs.
		The attributes are applied to the layer's path
		elements.
		*/
		layer.style = function(s) {
			if (!arguments.length) {
				return styles;
			}
			styles = modifyObject(styles, s);
			return layer;
		}
		layer.attr = function(a) {
			if (!arguments.length) {
				return attrs;
			}
			attrs = modifyObject(attrs, a);
			return layer;
		}
		layer.on = function(o) {
			if (!arguments.length) {
				return onFuncs;
			}
			onFuncs = modifyObject(onFuncs, o);
			return layer;
		}

		return layer;
	}

	function modifyObject(object, mod) {
		for (var key in mod) {
			if (mod[key] === null) {
				delete object[key];
			}
			else {
				object[key] = mod[key];
			}
		}
		return object;
	}

	return minimap;
})()

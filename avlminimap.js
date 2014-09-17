var avlminimap = (function(){
	var minimap = {}

	var uniqueGroupID = 0;

	function createUniqueGroupID() {
		return 'group-'+uniqueGroupID++;
	}

	minimap.ZoomMap = function() {
		var svg,
			width = window.innerWidth,
			height = window.innerHeight,
			groups,
			paths,
			layerCache = {},
			collection = { type: 'FeatureCollection', features: [] },
			projection = d3.geo.albers(),
			path = d3.geo.path().projection(projection),
			zoom = d3.behavior.zoom()
	            .scale(1<<8)
	            .scaleExtent([1<<5, 1<<12])
	            .translate([width/2, height/2])
	            .on("zoom", zoomMap);

		function zoomMap() {
			projection.scale(zoom.scale())
				.translate(zoom.translate());

			paths.attr('d', path);
		}

		function map(selection) {
			svg = selection
				.attr('class', 'avl-minimap-map')
				.attr('width', width)
				.attr('height', height)
				.call(zoom);
		}

		map.width = function(w) {
			if (!arguments.length) {
				return width;
			}
			width = w;
			return map;
		}
		map.height = function(h) {
			if (!arguments.length) {
				return height;
			}
			height = h;
			return map;
		}
		map.projection = function(p) {
			if (!arguments.length) {
				return projection;
			}
			projection = p;
			return map;
		}
		map.path = function(p) {
			if (!arguments.length) {
				return path;
			}
			path = p;
			return map;
		}
		map.draw = function() {
			for (var id in layerCache) {
				layerCache[id].draw();
			}
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
		map.reset = function() {
			return map.zoomToBounds(collection).transition();
		}
		map.append = function(l) {
			var id = createUniqueGroupID();

			layerCache[id] = l;

			if (!collection.features.length) {
				map.collection(l.data());
			}

			svg.append('g').attr('id', id)
				.attr('class', 'avl-minimap-group')
				.call(l, map, svg, id);

			groups = svg.selectAll('.avl-minimap-group');

			paths = groups.selectAll('path');

			return map;
		}
		map.collection = function(data) {
			if (!arguments.length) {
				return collection;
			}

			collection.features = [];

			data.forEach(function(d) {
				collection.features = collection.features.concat(d.features);
			})

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

	        zoom.scale(projection.scale())
	        	.translate(projection.translate());

	        return map;
	    }

		return map;
	}

	minimap.Map = function() {
		var svg,
			width = window.innerWidth,
			height = window.innerHeight,
			groups,
			paths,
			layerCache = {},
			collection = { type: 'FeatureCollection', features: [] },
			projection = d3.geo.albers(),
			path = d3.geo.path().projection(projection);

		function map(selection) {
			svg = selection
				.attr('class', 'avl-minimap-map')
				.attr('width', width)
				.attr('height', height);
		}

		map.width = function(w) {
			if (!arguments.length) {
				return width;
			}
			width = w;
			return map;
		}
		map.height = function(h) {
			if (!arguments.length) {
				return height;
			}
			height = h;
			return map;
		}
		map.projection = function(p) {
			if (!arguments.length) {
				return projection;
			}
			projection = p;
			return map;
		}
		map.path = function(p) {
			if (!arguments.length) {
				return path;
			}
			path = p;
			return map;
		}
		map.draw = function() {
			for (var id in layerCache) {
				layerCache[id].draw();
			}
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
		map.reset = function() {
			return map.zoomToBounds(collection).transition();
		}
		map.append = function(l) {
			var id = createUniqueGroupID();

			layerCache[id] = l;

			if (!collection.features.length) {
				map.collection(l.data());
			}

			svg.append('g').attr('id', id)
				.attr('class', 'avl-minimap-group')
				.call(l, map, svg, id);

			groups = svg.selectAll('.avl-minimap-group');

			paths = groups.selectAll('path');

			return map;
		}
		map.collection = function(data) {
			if (!arguments.length) {
				return collection;
			}

			collection.features = [];

			data.forEach(function(d) {
				collection.features = collection.features.concat(d.features);
			})

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

		return map;
	}

	minimap.Layer = function() {
		var data = [],
			json = function(d) { return d.features; },
			groups,
			styles,
			attrs,
			layerID,
			group,
			projection,
			path,
			onClick = null,
			activated = null,
			clickBack = null,
			svg,
			map,
			onEvents = {},
			callFunc;

		function layer(selection, _map, _svg, id) {
			if (selection) {
				group = selection;
				svg = _svg;
				layerID = id;
				map = _map;
				projection = map.projection();
				path = map.path();
			}

			groups = group.selectAll('g')
				.data(data);

			groups.exit().remove();

			groups.enter().append('g');

			layer.draw();
		}

		layer.data = function(d) {
			if (!arguments.length) {
				return data;
			}
			data = d;
			return layer;
		}
		layer.json = function(j) {
			if (!arguments.length) {
				return json;
			}
			json = j;
			return layer;
		}
		layer.on = function(o) {
			if (!arguments.length) {
				return onEvents;
			}
			onEvents = o;
			return layer;
		}
		layer.draw = function() {
			var paths = groups.selectAll('path')
				.data(function(d) { return json(d); });

			paths.enter().append('path')
				.attr('class', 'avl-minimap-path');
				
			paths.attr('d', path)
				.style(styles)
				.attr(attrs)
				.on('click.avl-minimap-click', onClick)
				.on(onEvents)
				.call(callFunc);
		}
		layer.styles = function(s) {
			if (!arguments.length) {
				return styles;
			}
			styles = s;
			return layer;
		}
		layer.attrs = function(a) {
			if (!arguments.length) {
				return attrs;
			}
			attrs = a;
			return layer;
		}
		layer.onClick = function(arg, cb) {
			switch(arg) {
				case 'zoom':
					onClick = zoom;
					break;
				case 'popout':
					onClick = popout;
					break;
			}
			if (cb) {
				clickBack = cb;
			}
console.log("???")
			return layer;
		}
		layer.call = function(c) {
			if (!arguments.length) {
				return callFunc;
			}
			callFunc = c;
			return layer;
		}

		function zoom(d) {
			if (activated == this) {
		        if (clickBack) {
		        	clickBack.bind(activated)(d);
		        }
				activated = null;
				map.reset();
				return;
			}

			activated = this;
			map.zoomToBounds(d);

			map.transition();

	        if (clickBack) {
	        	clickBack.bind(activated)(d);
	        }
		}

		function popout(d) {
			if (activated) {
				return;
			}

			activated = this;

			var p = d3.select(this);

			var tempNode = svg.node().appendChild(this.cloneNode());

			var temp = d3.select(tempNode)
				.datum(d)
				.attr('d', path)
				.on(onEvents)
				.attr('id', 'temp')
				.on('click.avl-minimap-temp', unpopout);

			var allPaths = svg.selectAll('path')
				.filter(function() { return this != tempNode; })

			allPaths.transition()
				.duration(250)
				.style('opacity', 0.25);

			p.style('display', 'none');

			var savedTranslate = projection.translate(),
				savedScale = projection.scale();

			map.zoomToBounds(d);

	        temp.transition()
	        	.duration(250)
	        	.attr('d', path)
	        	.each('end', function() {
			        if (clickBack) {
			        	clickBack.bind(tempNode)(d);
			        }
	        	});


	        function unpopout() {
		        projection.scale(savedScale)
		        	.translate(savedTranslate);

    			if (clickBack) {
    				clickBack.bind(tempNode)(d);
    			}

	        	allPaths.transition()
	        		.duration(250)
	        		.style('opacity', 1.0)
	        		.each('end', function() {
	        			d3.select(this).style('opacity', null);
	        		})

	        	temp.transition()
	        		.duration(250)
	        		.attr('d', path)
	        		.each('end', function() {
	        			activated = null;
	        			d3.select(this).remove();
	        			p.style('display', null);
	        		});
	        }
		}

		return layer;
	}

	return minimap;
})()
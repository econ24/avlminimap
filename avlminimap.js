var avlminimap = (function(){
	var minimap = {}

	var uniqueGroupID = 0,
	uniqueLayerID = 0;

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
			if (!svg) {
				svg = selection.append('svg')
					.attr('class', 'avl-minimap-map')
					.attr('width', width)
					.attr('height', height)
					.call(zoom);
			}
			map.draw();
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

			svg.append('g').attr('id', id)
				.attr('class', 'avl-minimap-group')
				.call(l, map, svg, id);

			groups = svg.selectAll('.avl-minimap-group');

			paths = groups.selectAll('path');

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
	    map.Layer = function() {
	    	return Layer();
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
			projection = d3.geo.albers(),
			path = d3.geo.path().projection(projection);

		function map(selection) {
			if (!svg) {
				svg = selection.append('svg')
					.attr('class', 'avl-minimap-map')
					.attr('width', width)
					.attr('height', height);
			}
			map.draw();
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

			svg.append('g').attr('id', id)
				.attr('class', 'avl-minimap-group')
				.call(l, map, svg, id);

			groups = svg.selectAll('.avl-minimap-group');

			paths = groups.selectAll('path');

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
	    	return Layer();
	    }

		return map;
	}

	minimap.CanvasMap = function() {
		var canvas,
			context,
			width = window.innerWidth,
			height = window.innerHeight,
			groups,
			paths,
			layerCache = {},
			projection = d3.geo.albers(),
			path = d3.geo.path().projection(projection);

		function map(selection) {
			if (arguments.length) {
				canvas = selection.append('canvas')
					.attr('class', 'avl-minimap-map');
				context = canvas.node().getContext('2d');
				path.context(context);
			}

			canvas
				.attr('width', width)
				.attr('height', height);

			map.draw();
		}

		var fill = d3.scale.quantile()
			.domain([0, 25, 50])
			.range(['#008', '#ff8', '#800']);

		function test() {
			var data = context.getImageData(d3.event.x, d3.event.y, 1, 1).data
				color = '#'+data[0].toString(16);
				color += data[1].toString(16);
				color += data[2].toString(16);
			console.log(fill.invert(color))
		}
		function dec2hex(dec) {
			var hex = 0;
			while (dec) {
				hex += 16
			}
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
			path.projection(p);
			return map;
		}
		map.path = function(p) {
			if (!arguments.length) {
				return path;
			}
			path = p;
			path.context(context);
			return map;
		}
		map.draw = function() {
			context.clearRect(0, 0, width, height);
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
		map.append = function(layr) {
			var id = createUniqueGroupID();

			layerCache[id] = layr;

			layr(this, context, id);

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
	    	return CanvasLayer();
	    }

		return map;
	}

	function CanvasLayer() {
		var data = [],
			json = function(d) { return d.features; },
			groups,
			styles,
			layerID,
			path,
			context,
			map;

		function layer(_map, _context, id) {
			if (arguments.length) {
				context = _context;
				layerID = id;
				map = _map;
				path = map.path();
			}

			map.draw();
		}

		layer.data = function(d) {
			if (!arguments.length) {
				return data;
			}
			data = d;
			return layer;
		}
		layer.draw = function() {
			var funcs = {};
			for (var key in styles) {
				if (typeof styles[key] == 'function') {
					funcs[key] = styles[key];
				}
				else {
					context[key+'Style'] = styles[key];	
				}
			}
			data.forEach(function(collection) {
				collection.features.forEach(function(feature, index) {
					for (var key in funcs) {
						context[key+'Style'] = funcs[key](feature, index);	
					}
					context.beginPath();
					path(feature);
					context.fill();
					context.stroke();
				})
			})
		}
		layer.styles = function(s) {
			if (!arguments.length) {
				return styles;
			}
			styles = s;
			return layer;
		}

		return layer;
	}

	function Layer() {
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
			callFunc,
			savedState = {translate: 0, scale: 0};

		function layer(selection, _map, _svg, id) {
			if (arguments.length) {
				group = selection;
				svg = _svg;
				layerID = id;
				map = _map;
				projection = map.projection();
				path = map.path();
			}

			groups = group.selectAll('g')
				.data(data, function() { return uniqueLayerID++; });

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
				projection.translate(savedState.translate)
					.scale(savedState.scale);
				map.transition();
				savedState.translate = 0;
				savedState.scale = 0;
				return;
			}
			if (!savedState.translate && !savedState.scale) {
				savedState.translate = projection.translate();
				savedState.scale = projection.scale();
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

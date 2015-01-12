var avlmenu = (function() {
	var avlmenu = {};

	var uniqueID = 0;

	function uniqueGroupID() {
		return 'avl-menu-group-'+uniqueID++;
	}
	function appendUniqueGroup(selection) {
		selection.append('g')
			.attr('id', uniqueGroupID);
	}

	function SelectionDecorator() {
		var classes = {},
			styles = {},
			attributes = {},
			indent = 0,
			secondaryDecorator;

		function decorator(selection) {
			selection.style(styles)
				.attr(attributes);

			for (var cls in classes) {
				selection.classed(cls, classes[cls]);
			}
			return selection;
		}

		decorator.applyClasses = function(selection) {
			for (var cls in classes) {
				selection.classed(cls, classes[cls]);
			}
			return selection;
		}
		decorator.applyStyles = function(selection) {
			return selection.style(styles);
		}
		decorator.applyAttributes = function(selection) {
			return selection.attr(attributes);
		}

		decorator.classes = function(c) {
			if (!arguments.length) {
				return classes;
			}
			classes = c;
			return decorator;
		}
		decorator.styles = function(s) {
			if (!arguments.length) {
				return styles;
			}
			styles = s;
			return decorator;
		}
		decorator.attributes = function(a) {
			if (!arguments.length) {
				return attributes;
			}
			attributes = a;
			return decorator;
		}
		decorator.indent = function(i) {
			if (!arguments.length) {
				return indent;
			}
			indent = i;
			return decorator;
		}
		decorator.secondaryDecorator = function(dec) {
			if (!arguments.length) {
				return secondaryDecorator;
			}
			secondaryDecorator = dec;
			return decorator;
		}

		return decorator;
	}

	avlmenu.populateTable = function(selection, data, textAccessor, click) {
			var tables = selection.selectAll('table')
				.data(data);

			tables.exit().remove();

			tables.enter().append('table')
				.attr('class', 'avl-menu-table')
				.each(function() { this.active = true; });

			var rows = tables.selectAll('tr')
				.data(function(d) { return d; });

			rows.exit().remove();

			rows.enter().append('tr');

			rows.classed('avl-menu-table-header', function(d) { return d.tableHeader; })
				.classed('avl-menu-even-row', function(d, i) { return !(i%2) })
				.classed('avl-menu-row-header', function(d) { return d.rowHeader; });

			if (click) {
				tables.call(onTableClick, data, click);
			}

			var columns = rows.selectAll('td')
				.data(function(d) { return d; }, function(d) { return d; });

			columns.exit().remove();

			columns.enter().append('td');

			columns
				.text(function(d) { return textAccessor(d); })
				.attr('class', 'avl-menu-table-column')
				.classed('avl-menu-row-header', function(d, i) { return i===0; });

			d3.selectAll('.avl-menu-table-header')
				.each(function(d) {
					if (d.span) {
						d3.select(this).selectAll('td')
							.attr('colspan', d.span);
					}
				})
	}

	function onTableClick(tables, data, click) {
		var table, tableSelection;

		tables.each(function(tableData) {
			table = this;
			tableSelection = d3.select(this);

			tableSelection
				.selectAll('.avl-menu-table-header')
				.each(function(data, index) {
					var header = this;
					
					d3.select(this).call(clickCases, data, index);
				})
		});

		function clickCases(selection, data, index) {
			switch (click) {
				case 'close':
					selection.on('click.avl-menu', function() {
						d3.event.stopPropagation();
						table.active = !table.active;
						tableSelection.selectAll('tr').filter(function(d) { return this != header; })
							.classed('avl-menu-table-inactive', !table.active);
					})
					break;
			}
		}
	}

	avlmenu.Footer = function() {
		var _footer = null,
			text;

		function footer() {
			_footer.text(text);
		}
		footer.init = function(selection, decorator) {
			_footer = selection.append('div')
				.attr('class', 'avl-menu-footer')
				.text(text);

			if (decorator) {
				_footer.call(decorator);
			}
			return footer;
		}
		footer.text = function(t) {
			if (!arguments.length) {
				return text;
			}
			text = t;
			return footer;
		}
		return footer;
	}

	avlmenu.Banner = function() {
		var back = null,
			_banner = null,
			text = '',
			left = 0,
			top = 0,
			awake = false,
			dispatcher = d3.dispatch('click');

		function banner() {
			_banner.text(text)

			back.transition().duration(500)
				.style('top', top+'px')
				.style('left', left+'px');

			_banner.classed('avl-menu-banner-awake', awake);
		}
		banner.init = function(selection, decorator) {
			back = selection.append('div')
				.attr('class', 'avl-menu-banner-back')
			_banner = back.append('div')
				.attr('class', 'avl-menu-banner');

			if (decorator) {
				_banner.call(decorator);
			}

			return banner;
		}
		banner.left = function(l) {
			if (!arguments.length) {
				return left;
			}
			left = l;
			return banner;
		}
		banner.top = function(t) {
			if (!arguments.length) {
				return top;
			}
			top = t;
			return banner;
		}
		banner.text = function(t) {
			if (!arguments.length) {
				return text;
			}
			text = t;
			return banner;
		}
		banner.awake = function(bool) {
			if (!arguments.length) {
				return awake;
			}
			awake = bool;
			return banner;
		}
		banner.on = function(event, func) {
			if (!arguments.length) {
				return banner;
			}
			if (arguments.length == 1) {
				return dispatcher.on(event);
			}
			dispatcher.on(event, func);
			return banner;
		}

		return banner;
	}

	avlmenu.Popup = function() {
		var _popup = null,
			visible = false,
			data = [],
			position = 'top-right',
			allPositions = {
				'top-right': 'avl-menu-top-right',
				'bottom-right': 'avl-menu-bottom-right',
				'bottom-left': 'avl-menu-bottom-left',
				'top-left': 'avl-menu-top-left',
				'floater': 'avl-menu-floater'
			},
			textAccessor = function(d) { return d; },
			onClick = 'close';

		function popup() {
			_popup.classed('avl-menu-popup-hide', !visible);

			for (var key in allPositions) {
				_popup.classed(allPositions[key], false);
			}
			_popup.classed(allPositions[position], true);

			_popup.call(avlmenu.populateTable, data, textAccessor, onClick);
		}
		popup.init = function(selection, decorator) {
			_popup = selection.append('div')
				.attr('class', 'avl-menu-popup')
				.classed('avl-menu-popup-hide', !visible);
			if (position == 'floater') {
				selection.call(makeFloater);
			}

			if (decorator) {
				_popup.call(decorator);
			}
			return popup;
		}
		popup.onClick = function(type) {
			if (!arguments.length) {
				return onClick;
			}
			onClick = type;
			return popup;
		}
		popup.position = function(p) {
			if (!arguments.length) {
				return position;
			}
			position = p;
			return popup;
		}
		popup.visible = function(bool) {
			if (!arguments.length) {
				return visible;
			}
			visible = bool;
			return popup;
		}
		popup.data = function(d) {
			if (!arguments.length) {
				return data;
			}
			data = d;
			return popup;
		}

		function makeFloater(selection) {
			selection.on('mousemove.avl-menu', function() {
				var x = d3.event.x + 5,
					y = d3.event.y + 5;

				var width = _popup.node().offsetWidth,
					height = _popup.node().offsetHeight;

				if (x+width > window.innerWidth) {
					x = x-10 - width;
				}
				if (y+height > window.innerHeight) {
					y = y-10 - height;
				}

				_popup.style('left', x+'px')
					.style('top', y+'px')
			})
		}

		return popup;
	}

	avlmenu.Tab = function() {
		var toggles,
			data = [],
			parent,
			text = function(d) { return d.text; },
			activeTab = 0,
			dispatcher = d3.dispatch('tabfocus', 'tabunfocus');

		function tab() {
			toggles.data(data)();
		}
		tab.init = function(selection, _decorator) {
			parent = selection;
			toggles = avlmenu.Toggle()
				.deselectAll(false)
				.makeActive(activeTab)
				.init(selection, _decorator);

			return tab;
		}
		tab.data = function(d) {
			if (!arguments.length) {
				return data;
			}
			data = d;

			data.forEach(function(d, i) {
				d.tab = d3.select(d.id)
					.classed('avl-menu-tab', true)
					.style('display', 'none');

				d.select = onSelect;

				d.deselect = onDeselect;
			});

			return tab;
		}
		tab.on = function(event, func) {
			if (!arguments.length) {
				return tab;
			}
			if (arguments.length == 1) {
				return dispatcher.on(event);
			}
			dispatcher.on(event, func);
			return tab;
		}

		function onSelect(d, i) {
			d.tab.style('display', 'block');
			activeTab = i;
			dispatcher.tabfocus.call(this, d, i);
		}
		function onDeselect(d, i) {
			d.tab.style('display', 'none');
			dispatcher.tabunfocus.call(this, d, i);
		}

		return tab;
	}

	avlmenu.Dropdown = function() {
		var _dropdown,
			_toggles,
			parent,
			groupID,
			styles = {},
			classes = [],
			data = [],
			text = function(d) { return d.text; },
			multi = false,
			selfDecorator,
			appendDecorator = SelectionDecorator();

		function dropdown() {
			var container = parent.selectAll(groupID+' > .avl-menu-dropdown-container')
				.data(data);

			container.exit().remove();

			container.enter().append('div')
				.attr('class', 'avl-menu-dropdown-container')
				.each(createDropdown);

 			_toggles = parent.selectAll(groupID+' > .avl-menu-dropdown-container > g > .avl-menu-button')
 				.classed('avl-menu-dropdown-header', true)
				.call(selfDecorator.applyClasses);

			_dropdown = parent.selectAll(groupID+' > .avl-menu-dropdown-container > .avl-menu-dropdown');

			_dropdown.style('max-height', function() {
				var maxHeight = window.innerHeight-this.offsetTop;

				return maxHeight+'px';
			});

			container.call(selfDecorator.applyStyles);
			_dropdown.call(selfDecorator.applyStyles);
		}
		dropdown.init = function(selection, _decorator) {
			parent = selection;
			groupID = '#'+selection.attr('id');
			selfDecorator = _decorator;
			var indent = _decorator.indent()+15;

			appendDecorator
				.indent(indent)
				.styles({'max-height': 'none', 'overflow-y': 'hidden', 'text-indent': indent+'px'});
			return dropdown;
		}
		dropdown.data = function(d) {
			if (!arguments.length) {
				return data;
			}
			data = d;
			return dropdown;
		}
		dropdown.each = function(func) {
			var savedDropdown = _dropdown,
				x = 0;

			savedDropdown.each(function(d, i) {
				_dropdown = savedDropdown.filter(function(d, idx) { return x === idx; });

				func.bind(this)(d, i);

				x++;
			});

			_dropdown = savedDropdown;
			return dropdown;
		}
		dropdown.append = function(object, obj) {
			var selection = _dropdown;

			if (arguments.length == 2) {
				if (obj.id) {
					selection = _dropdown
						.filter(function(d) { return d.id == obj.id; });
				}
				else if (obj.filter) {
					selection = _dropdown
						.filter(function(d, i) { return obj.filter.bind(this)(d, i); });
				}
			}

			selection
				.append('g').attr('id', uniqueGroupID)
				.call(object.init, appendDecorator);
			object();

			return dropdown;
		}
		dropdown.multi = function(m) {
			if (!arguments.length) {
				return multi;
			}
			multi = m;
			return dropdown;
		}

		function createDropdown(d, i) {
			var container = d3.select(this);

			var dd = container
				.append('div')
				.attr('class', 'avl-menu-dropdown')
				.style('height', '0px');

			var toggle = avlmenu.Toggle()
				.on('select', toggleDropdown)
				.on('deselect', toggleDropdown)
				.data([{ text: text(d), dropdown: dd }]);

			container.insert('g', ':first-child').attr('id', uniqueGroupID).call(toggle.init);
			toggle();
		}

		function toggleDropdown(d) {
			var dd = d.dropdown,
				button = this;

			if (!multi) {
				_toggles
					.filter(function() { return this != button; })
					.each(function() { this.selected = false; })
					.classed('avl-menu-button-selected', false);

				var filtered = _dropdown
					.filter(function(d) { return d.dropdown != dd; });

				adjustHeight(filtered, 0);
			}

			if (this.selected) {
				_dropdown.style('display', null);

				dd.style('height', 'auto');
				var height = dd.node().offsetHeight;
				dd.style('height', '0px');

				adjustHeight(dd, height, true);
			}
			else {
				adjustHeight(dd, 0);
				_dropdown.transition().delay(250).style('display', 'none');
			}
		}

		function adjustHeight(selection, height, auto) {
			selection
				.transition()
				.duration(250)
				.style('height', height+'px')
				.each('end', function() {
					if (auto) {
						selection.style('height', 'auto');
					}
				});
		}

		return dropdown;
	}

	avlmenu.Button = function() {
		var _button = null,
			parent,
			groupID,
			styles = {},
			data = [],
			text = function(d) { return d.text; },
			decorator,
			dispatcher = d3.dispatch('click');

		function button() {
			_button = parent
				.selectAll(groupID+' > .avl-menu-button')
				.data(data);

			_button.exit().remove();

			_button.enter().append('a')
				.attr('class', 'avl-menu-button');

			_button
				.text(function(d) { return text(d); })
				.on(events);

			if (decorator) {
				_button.call(decorator.applyStyles);
			}
		}
		button.init = function(selection, _decorator) {
			parent = selection;
			groupID = '#'+selection.attr('id');
			decorator = _decorator;
			return button;
		}
		button.data = function(d) {
			if (!arguments.length) {
				return data;
			}
			data = d;
			return button;
		}
		button.text = function(t) {
			if (!arguments.length) {
				return text;
			}
			text = t;
			return button;
		};
		button.on = function(event, func) {
			if (!arguments.length) {
				return button;
			}
			if (arguments.length == 1) {
				return dispatcher.on(event);
			}
			dispatcher.on(event, func);
			return button;
		}

		return button;
	}

	avlmenu.Toggle = function() {
		var _toggle,
			parent,
			decorator,
			groupID,
			data = [],
			makeActive = -1,
			text = function(d) { return d.text; },
			multi = false,
			deselectAll = true,
			activeToggle = null,
			dispatcher = d3.dispatch('select', 'deselect');

		function toggle() {
			_toggle = parent
				.selectAll('.avl-menu-button')
				.data(data);

			_toggle.exit().remove();

			_toggle.enter().append('a')
				.attr('class', 'avl-menu-button')
				.on('click', toggled)
				.each(function(d, i) {
					this.selected = false;
					if (i == makeActive) {
						toggled.call(this, d);
					}
				});

			_toggle
				.text(function(d) { return text(d); });

			if (decorator) {
				_toggle.call(decorator);
			}
		}
		toggle.init = function(selection, _decorator) {
			groupId = '#'+selection.attr('id');
			parent = selection;
			decorator = _decorator;
			return toggle;
		}
		toggle.data = function(d) {
			if (!arguments.length) {
				return data;
			}
			data = d;
			return toggle;
		}
		toggle.text = function(t) {
			if (!arguments.length) {
				return text;
			}
			text = t;
			return toggle;
		};
		toggle.multi = function(m) {
			if (!arguments.length) {
				return multi;
			}
			multi = m;
			return toggle;
		}
		toggle.deselectAll = function(d) {
			if (!arguments.length) {
				return deselectAll;
			}
			deselectAll = d;
			if (deselectAll && makeActive < 0) {
				makeActive = 0;
			}
			return toggle;
		}
		toggle.makeActive = function(index) {
			if (!arguments.length) {
				return makeActive;
			}
			makeActive = index;
			return toggle;
		}
		toggle.on = function(event, func) {
			if (!arguments.length) {
				return toggle;
			}
			if (arguments.length == 1) {
				return dispatcher.on(event);
			}
			dispatcher.on(event, func);
			return toggle;
		}

		function toggled(d) {
			var toggle = d3.select(this),
				self = this;

			if (!deselectAll && this.selected) {
				return;
			}

			this.selected = !this.selected;

			if (this.selected && !multi) {
				_toggle
					.filter(function() { return this != self; })
					.classed('avl-menu-button-selected', false)
					.each(function(d) {
						if (this.selected) {
							dispatcher.deselect.call(this, d);
							this.selected = false;
						}
					});
			}

			toggle.classed('avl-menu-button-selected', this.selected);

			if (this.selected) {
				dispatcher.select.call(this, d);
			}
			else if (!this.selected) {
				dispatcher.deselect.call(this, d);
			}
		}

		return toggle;
	}

	avlmenu.Menubar = function() {
		var _menubar,
			decorator = SelectionDecorator()
				.styles({float:'left'})
				.classes({'avl-menu-bar-item':true});

		function menubar(selection) {
			_menubar = selection.append('div')
				.attr('class', 'avl-menu-menubar');
		}
		menubar.append = function(object) {
			_menubar.append('g').attr('id', uniqueGroupID)
				.call(object.init, decorator);
			object();
			return menubar;
		}

		return menubar;
	}

	avlmenu.Sidebar = function() {
		var _sidebar,
			face,
			top = '0px',
			height = '100%',
			open = true,
			decorator = SelectionDecorator()
				.styles({display:'block', 'max-width': '155px'})
				.classes({'avl-menu-bar-item':true});

		function sidebar() {
			_sidebar.style({top: top, height: height});
		}

		sidebar.init = function(selection) {
			_sidebar = selection.append('div')
				.on('click', toggle, true)
				.attr('class', 'avl-menu-sidebar');

			face = _sidebar.append('div')
				.on('.avl-menu-sidebar', null)
				.attr('class', 'avl-menu-sidebar-front');
			return sidebar;
		}
		sidebar.append = function(object) {
			face.append('g').attr('id', uniqueGroupID)
				.call(object.init, decorator);
			object();
			return sidebar;
		}
		sidebar.top = function(t) {
			if (!arguments.length) {
				return top;
			}
			top = t;
			return sidebar;
		}
		sidebar.height = function(h) {
			if (!arguments.length) {
				return height;
			}
			height = h;
			return sidebar;
		}

		function toggle() {
			if (d3.event.target != this) {
				return;
			}

			open = !open;

			if (!open) {
				_sidebar.transition().duration(500)
					.style('width', '20px')
				
				face.transition().duration(500)
					.style('width', '0px')
			}
			else {
				_sidebar.transition().duration(500)
					.style('width', '180px')

				face.transition().duration(500)
					.style('width', '165px')
			}
		}

		return sidebar;
	}

	return avlmenu;
})()
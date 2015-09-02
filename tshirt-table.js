(function ($, window, document) {
	"use strict";

	// Global variable
	window.scrolltimeout = null;
	window.vscrollbartimeout =  null;
	window.hscrollbartimeout =  null;

	// Case Insensitive contains pseudo selector
	$.expr[":"].contains = $.expr.createPseudo(function(arg) {
		return function( elem ) {
			return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
		};
	});

	$.fn.table = function (options) {
		// Default Settings
		var defaults = {
				freezeRow: 0,
				freezeCol: 0,
				config: {},
				data: {},
				gap: 1,
				rubber: true,
				highlight: true,
				done: function (data) {}
			},
			settings = $.extend({}, defaults, options);

		this.each(function () {
			this.start = new Date().getTime();
			// Table have the same config settings
			this.id = "table-" + new Date().getTime();
			this.freezeRow = settings.freezeRow;
			this.freezeCol = settings.freezeCol;
			this.config = settings.config;
			this.data = settings.data;
			this.realdata = settings.data;
			this.gap = settings.gap;
			this.rubber = settings.rubber;
			this.highlight = settings.highlight;
			this.done = settings.done;
			this.tableWidth = 0;
			this.tableWidthLeft = 0;
			this.tableWidthRight = 0;
			this.wrapperTableWidth = 0;
			this.smallerTable = false;

			// Helper to draw row and column
			this._draw = function (data, config, startRow, startCol, endRow, endCol, isHead) {
				var html = "",
					dataAlign = "",
					content = "",
					tableWidth = 0,
					rowWidth = 0;

				data = (!data) ? [] : data;

				if (!data[0]) data[0] = [];

				startRow = (startRow === null)? 0: startRow;
				startCol = (startCol === null)? 0: startCol;
				endRow = (endRow === null)? data.length: endRow;
				endCol = (endCol === null)? data[0].length: endCol;

				// Count the table width, only once
				if (this.tableWidth === 0) {
					for (var i = this.config.width.length - 1; i >= 0; i--) {
						if (this.config.width[i].indexOf("/") < 0)
							tableWidth += parseInt(this.config.width[i]);
						else {
							var tempWidth = this.config.width[i].split ("/");
							tableWidth += parseInt(tempWidth[0]);
						}
					};

					this.tableWidth = tableWidth;
					this.wrapperTableWidth = document.getElementById(this.id).offsetWidth;

					if (this.tableWidth < this.wrapperTableWidth) this.smallerTable = true;
				}

				// Count the row width, only once
				if (rowWidth === 0) {
					for (var indexCol = startCol; indexCol < endCol; indexCol++) {
						if (config.width[indexCol].indexOf("/") < 0)
							rowWidth += parseInt(config.width[indexCol]);
						else {
							var tempWidth = config.width[indexCol].split ("/");
							rowWidth += parseInt(tempWidth[0]);
						}
					}
				}

				for (var indexRow = startRow; indexRow < endRow; indexRow++) {
					var arraySubValue = [],
						indexesSubValue = [],
						dataAlign = "";

					// Draw one row
					html += '<div class="flx-rw rw-' + indexRow + '" data-row="' + indexRow + '">';
					for (var indexCol = startCol; indexCol < endCol; indexCol++) {
						var dataRowCol = data[indexRow][indexCol],
							columnWidth = 0;

						// Only display non zero width content
						if (config.width[indexCol] !== "0") {
							dataAlign = "";
							if (typeof config.type[indexCol] === "function")
								dataAlign += "flx-cl-func ";
							if (config.type[indexCol] === "left")
								dataAlign += "flx-cl-lf ";
							if (config.type[indexCol] === "right")
								dataAlign += "flx-cl-rg ";
							if (config.type[indexCol] === "center")
								dataAlign += "flx-cl-ct ";

							// Check if the config says that it have sub value
							if (config.width[indexCol].indexOf ("/") < 0) {
								columnWidth = config.width[indexCol];
							} else {
								arraySubValue = config.width[indexCol].split ("/");
								indexesSubValue = arraySubValue[1].split (":");
								columnWidth = arraySubValue[0];
							}

							if (this.smallerTable)
								columnWidth = (columnWidth / rowWidth * 100) + "%";
							else
								columnWidth += "px";

							if (isHead === true) {
								if (config.width[indexCol].indexOf ("/") >= 0) html += '<div class="cl-' + indexCol + ' flx-cl flx-cl-mr ' + dataAlign + '" style="width:' + columnWidth + '"><div class="pad">';
								else html += '<div class="cl-' + indexCol + ' flx-cl ' + dataAlign + '" style="width:' + columnWidth + '"><div class="pad">';
									// Column is findable
									if (config.find)
										if (config.find[indexCol]) {
											html += '<input type="text" data-search="' + indexCol + '" placeholder="' + dataRowCol + '" style="display:none" />';
											html += '<span class="search">' + dataRowCol + '</span>';
										} else
											html += '<span>' + dataRowCol + '</span>';
									else
										html += '<span>' + dataRowCol + '</span>';

									// Column is sortable
									if (config.sort)
										if (config.sort[indexCol])
											html += '<span class="sort" data-sort="' + indexCol + '">&nbsp;</span>';

									// Column have sub content
									if (config.width[indexCol].indexOf ("/") >= 0) {
										html += '<span class="sub">';
											for (var i = 0; i < indexesSubValue.length; i++) {
												html += '<span class="cl-' + indexesSubValue[i] + '">' + data[indexRow][indexesSubValue[i]] + '</span>';
											}
										html += '</span>';
									}
								html += '</div></div>';
							} else {
								if (typeof config.type[indexCol] === "function") dataRowCol = config.type[indexCol](indexCol, data[indexRow][indexCol]);

								if (dataRowCol === undefined) dataRowCol = "-";

								if (config.width[indexCol].indexOf ("/") >= 0) html += '<div class="cl-' + indexCol + ' flx-cl flx-cl-mr ' + dataAlign + '" style="width:' + columnWidth + '"><div class="pad">';
								else html += '<div class="cl-' + indexCol + ' flx-cl ' + dataAlign + '" style="width:' + columnWidth + '"><div class="pad">';
									html += '<span class="cnt">' + dataRowCol + '</span>';
									if (config.width[indexCol].indexOf ("/") >= 0) {
										html += '<span class="sub">';
											for (var i = 0; i < indexesSubValue.length; i++)
												html += '<span class="cl-' + indexesSubValue[i] + '">' + data[indexRow][indexesSubValue[i]] + '</span>';
										html += '</span>';
									}
								html += '</div></div>';
							}
						}

						// If the type is value, then add aditional hidden column that contain data-value
						if (config.type[indexCol] === "value") {
							if (isHead === true) {
								html += '<div class="cl-' + indexCol + ' flx-cl ' + dataAlign + '" style="display:none"></div>';
							} else {
								html += '<div class="cl-' + indexCol + ' flx-cl ' + dataAlign + '" style="display:none" data-value="' + dataRowCol + '"></div>';
							}
						}
					}
					html += '</div>';
				}

				return {
					html: html,
					width: rowWidth
				}
			}

			// Helper to make the row and column have fix width and height
			this._fixsize = function () {
				var left = 0,
					top = 0,
					width = 0,
					widthRight = 0,
					height = 0,
					topheight = 0,
					bottomheight = 0,
					col = this.freezeCol,
					row = this.freezeRow,
					id = this.id,
					el;

				//
				// Reset size
				//

				// Set height of the header row so it will have the same row height
				el = document.querySelectorAll("#" + id + " .flx-tprg .flx-rw");
				for (var index = el.length - 1; index >= 0; index--) {
					var height = 0,
						heightlf = 0;

					// Reset the height first
					document.querySelector("#" + id + " .flx-tprg .rw-" + index).style.height = '';
					document.querySelector("#" + id + " .flx-tplf .rw-" + index).style.height = '';

					height = document.querySelector("#" + id + " .flx-tprg .rw-" + index).offsetHeight;
					heightlf = document.querySelector("#" + id + " .flx-tplf .rw-" + index).offsetHeight;

					if (heightlf > height) height = heightlf;
					topheight += height;

					document.querySelector("#" + id + " .flx-rw-hdr .rw-" + index).style.height = height + "px";
				}

				// Get the top and left freeze points
				top = topheight;
				if (this.smallerTable)
					left = (this.tableWidthLeft / this.tableWidth * 100) + "%";
				else
					left = (this.tableWidthLeft + this.gap) + "px";

				el = document.querySelector("#" + id + " .flx-rw-hdr");
				el.style.height = top + "px";
				el = document.querySelector("#" + id + " .flx-tplf");
				el.style.width = left;
				el = document.querySelector("#" + id + " .flx-tprg");
				el.style.height = top + "px";
				if (this.smallerTable) el.style.left = left;
				else el.style.left = left;
				el.style.right = 0;

				// Set height of the content row so it will have the same row height
				el = document.querySelectorAll("#" + id + " .flx-btrg .flx-rw");
				for (var index = el.length - 1; index >= 0; index--) {
					var height = 0,
						heightlf = 0,
						_index;

					_index = index + row;

					// Reset the height first
					document.querySelector("#" + id + " .flx-btrg .rw-" + _index).style.height = '';
					document.querySelector("#" + id + " .flx-btlf .rw-" + _index).style.height = '';

					height = document.querySelector("#" + id + " .flx-btrg .rw-" + _index).offsetHeight,
					heightlf = document.querySelector("#" + id + " .flx-btlf .rw-" + _index).offsetHeight;

					if (heightlf > height) height = heightlf;
					bottomheight += height; // unused for now

					document.querySelector("#" + id + " .flx-rw-cnt .flx-btlf .rw-" + _index).style.height = height + "px";
					document.querySelector("#" + id + " .flx-rw-cnt .flx-btrg .rw-" + _index).style.height = height + "px";
				}

				// Make the bottom left and bottom right content to have fix width and height
				el = document.querySelector("#" + id + " .flx-btlf");
				el.style.width = left;
				el.style.left = 0;
				el = document.querySelector("#" + id + " .flx-btrg");
				if (this.smallerTable) el.style.left = left;
				else el.style.left = left;
				el.style.right = 0;

				el = document.querySelector("#" + id + " .tbl-scrl-ver");

				el.style.top = (top + this.gap) + "px";
				el.style.bottom = 0;
				el.style.left = 0;
				el.style.right = 0;

				// Make the scroll area the exact width as the content
				el = document.querySelector("#" + id + " .flx-tprg > div");
				if (this.smallerTable)
					el.style.width = "100%";
				else
					el.style.width = this.tableWidthRight + "px";
				el = document.querySelector("#" + id + " .flx-btrg > div");
				if (this.smallerTable)
					el.style.width = "100%";
				else
					el.style.width = this.tableWidthRight + "px";
			}

			// Helper to add odd and event to row
			this._stripes = function () {
				$(this).find (".flx-rw-cnt .flx-rw").removeClass ("odd even");
				$(this).find (".flx-rw-cnt .flx-rw:visible:odd").addClass ("odd");
				$(this).find (".flx-rw-cnt .flx-rw:visible:even").addClass ("even");
			}

			this._drawStructure = function () {
				var html = "";

				if (this.querySelector(".flx-rw-hdr") === null) {
					// Draw the header
					html += '<div class="flx-rw-hdr">';
						html += '<div class="flx-tplf">';
						html += '</div>';
						html += '<div class="flx-tprg tbl-scrl-hor">';
							html += '<div data-twin="hor' + this.id + '">';
							html += '</div>';
						html += '</div>';
						html += '<div class="clear"></div>';
					html += '</div>';

					// Draw the content
					html += '<div class="flx-rw-cnt tbl-scrl-ver">';
						html += '<div class="scroll">';
							html += '<div class="flx-btlf">';
							html += '</div>';
							html += '<div class="flx-btrg tbl-scrl-hor">';
								html += '<div data-twin="hor' + this.id + '">';
								html += '</div>';
							html += '</div>';
							html += '<div class="clear"></div>';
						html += '</div>';
					html += '</div>';

					// Draw scrollbar
					html += "<div class='scrollbar hscrollbar'><div class='hslider'></div></div>"
					html += "<div class='scrollbar vscrollbar'><div class='vslider'></div></div>"

					// Put it to the HTML
					this.className += " flx-tbl";

					// Faster than .html ()
					this.innerHTML = html;

					return true;
				}

				return false;
			}

			// Helper to draw the table and add scroll function
			this._drawHead = function () {
				var html = "";

				html = this._draw (this.data, this.config, 0, 0, this.freezeRow, this.freezeCol, true);
				this.querySelector(".flx-tplf").innerHTML = html.html;
				this.tableWidthLeft = html.width;
				html = this._draw (this.data, this.config, 0, this.freezeCol, this.freezeRow, null, true);
				this.querySelector(".flx-tprg > div").innerHTML = html.html
				this.tableWidthRight = html.width;
			}
			this._drawBody = function () {
				var html = "";

				html = this._draw (this.data, this.config, this.freezeRow, 0, null, this.freezeCol, false);
				this.querySelector(".flx-btlf").innerHTML = html.html;
				html = this._draw (this.data, this.config, this.freezeRow, this.freezeCol, null, null, false);
				this.querySelector(".flx-btrg > div").innerHTML = html.html;
			}
			this.draw = function () {
				var html = "",
					assignscroll = false,
					tableWidth = 0,
					that = this,
					timer = 512;

				// Scroll element,
				var oldPosX = 0,
					oldPosY = 0,
					deltaX = 0,
					deltaY = 0,
					scrollPosX = 0,
					scrollPosY = 0,
					scrollMapX = 0,
					scrollMapY = 0;

				// Common scrollbar helper
				var updateVScrollPosition = function (vslider, vscrollbar, percentageY, transition) {
						if (percentageY < 0) percentageY = 0;
						else if (percentageY > 1) percentageY = 1;

						vslider.style.opacity = 1;
						vslider.style.top = (vscrollbar.offsetHeight - vslider.offsetHeight) * percentageY;
						vslider.style.transition = transition;

						clearTimeout(vscrollbartimeout);
						vscrollbartimeout = setTimeout (function () {
							clearTimeout(vscrollbartimeout);
							vslider.style.opacity = "";
							vslider.style.transition = "";
						}, (timer + (timer / 4)));
					}, updateHScrollPosition = function (hslider, hscrollbar, percentageX, transition) {
						if (percentageX < 0) percentageX = 0;
						if (percentageX > 1) percentageX = 1;

						hslider.style.opacity = 1;
						hslider.style.left = (hscrollbar.offsetWidth - hslider.offsetWidth) * percentageX;
						hslider.style.transition = transition;

						clearTimeout(hscrollbartimeout);
						hscrollbartimeout = setTimeout (function () {
							clearTimeout(hscrollbartimeout);
							hslider.style.opacity = "";
							hslider.style.transition = "";
						}, (timer + (timer / 4)));
					};

				// Helper content position
				var updateContentPosition = function (elem, posX, posY, scaleX, scaleY, originX, originY, transition) {
						$(elem).css ({
							"transform": "translate3d(" + posX + "px," + posY + "px,0) scale3d(" + scaleX + "," + scaleY + ",1)",
							"transform-origin": originX + "% " + originY + "%",
							"transition": transition
						});
					};

				assignscroll = that._drawStructure ();
				that._drawHead ();
				that._drawBody ();

				// Apply odd and even
				that._stripes ();

				// Make the column and row fixed size
				that._fixsize ();

				if (assignscroll) {
					// Create scrollbar
					var hsliderwidth = (that.querySelector(".tbl-scrl-hor").offsetWidth / that.querySelector(".tbl-scrl-hor > div").offsetWidth * 100),
						vsliderheight = (that.querySelector(".tbl-scrl-ver").offsetHeight / that.querySelector(".tbl-scrl-ver > div").offsetHeight * 100);

					// Constrain the slider size so it won't be to small
					if (hsliderwidth < 32) hsliderwidth = 32;
					if (vsliderheight < 32) vsliderheight = 32;

					that.querySelector(".hslider").style.width = hsliderwidth * that.querySelector(".hscrollbar").offsetWidth / 100;
					that.querySelector(".vslider").style.height = vsliderheight * that.querySelector(".vscrollbar").offsetHeight / 100;

					// Call the scroller, only once to save CPU cycle
					$(that).find (".tbl-scrl-hor > div").scroll ({
						scrollVertical: false,
						scrollHorizontal: true,
						showScroll: false,
						rubber: that.rubber,
						onScroll:function (posX, posY, scaleX, scaleY, originX, originY, transition, state) {
							var hslider = that.querySelector(".hslider"),
								hscrollbar = that.querySelector(".hscrollbar"),
								percentageX = Math.abs(posX / (that.querySelector(".tbl-scrl-hor > div").offsetWidth - that.querySelector(".tbl-scrl-hor").offsetWidth));

							if (posX != oldPosX) {
								oldPosX = posX;
								updateHScrollPosition (hslider, hscrollbar, percentageX, transition);
							}
						}
					});
					$(that).find (".tbl-scrl-ver > div").scroll ({
						scrollVertical: true,
						scrollHorizontal: false,
						showScroll: false,
						rubber: that.rubber,
						onScroll:function (posX, posY, scaleX, scaleY, originX, originY, transition, state) {
							var vslider = that.querySelector(".vslider"),
								vscrollbar = that.querySelector(".vscrollbar"),
								percentageY = Math.abs(posY / (that.querySelector(".tbl-scrl-ver > div").offsetHeight - that.querySelector(".tbl-scrl-ver").offsetHeight));

							if (posY != oldPosY) {
								oldPosY = posY;
								updateVScrollPosition (vslider, vscrollbar, percentageY, transition);
							}
						}
					});

					// Scrollbar actions
					$(this).find(".hslider").hammer().on("dragstart drag dragend tap", function(event) {
						var hslider = that.querySelector(".hslider"),
							hscrollbar = that.querySelector(".hscrollbar"),
							percentageX = 0;

						if (event.type === "dragstart") {
							// Constrain movement
							scrollPosX = scrollMapX = parseInt($(this).position().left);
						}
						if (event.type === 'drag' || event.type === 'dragend') {
							// Count movement delta
							deltaX = -event.gesture.deltaX;
							// Constrain movement
							scrollPosX = scrollMapX - deltaX;
						}

						if (scrollPosX < 0) scrollPosX = 0;
						if (scrollPosX > (hscrollbar.offsetWidth - hslider.offsetWidth)) scrollPosX = hscrollbar.offsetWidth - hslider.offsetWidth;

						percentageX = Math.abs(scrollPosX / (hscrollbar.offsetWidth - hslider.offsetWidth));

						updateHScrollPosition (hslider, hscrollbar, percentageX, "all 0s linear");
						updateContentPosition ($(that).find(".tbl-scrl-hor > div"), percentageX * (that.querySelector(".tbl-scrl-hor").offsetWidth - that.querySelector(".tbl-scrl-hor > div").offsetWidth), 0, 1, 1, 0, 0, "all 0s linear") ;
					});
					$(this).find(".vslider").hammer().on("dragstart drag dragend tap", function(event) {
						var vslider = that.querySelector(".vslider"),
							vscrollbar = that.querySelector(".vscrollbar"),
							percentageY = 0;

						if (event.type === "dragstart") {
							// Constrain movement
							scrollPosY = scrollMapY = parseInt($(this).position().top);
						}
						if (event.type === 'drag' || event.type === 'dragend') {
							// Count movement delta
							deltaY = -event.gesture.deltaY;
							// Constrain movement
							scrollPosY = scrollMapY - deltaY;
						}

						if (scrollPosY < 0) scrollPosY = 0;
						if (scrollPosY > (vscrollbar.offsetHeight - vslider.offsetHeight)) scrollPosY = vscrollbar.offsetHeight - vslider.offsetHeight;

						percentageY = Math.abs(scrollPosY / (vscrollbar.offsetHeight - vslider.offsetHeight));

						updateVScrollPosition (vslider, vscrollbar, percentageY, "all 0s linear");
						updateContentPosition ($(that).find(".tbl-scrl-ver > div"), 0, percentageY * (that.querySelector(".tbl-scrl-ver").offsetHeight - that.querySelector(".tbl-scrl-ver > div").offsetHeight), 1, 1, 0, 0, "all 0s linear") ;
					});
				}

				// Counts
				that.end = new Date().getTime();
			}

			// Push new data to table
			this.push = function (_options) {
				this.start = new Date().getTime();

				// Default Settings
				var _defaults = {
						row: true,
						data: [],
						done: function (data) {}
					},
					_split = [],
					_temp = [],
					_settings = $.extend({}, _defaults, _options);

				if (_settings.row >= 1) {
					_settings.row--;
					if (_settings.row > settings.data.length)
						_settings.row = settings.data.length;
				} else {
					_settings.row = settings.data.length;
				}

				// Push before
				for (var i = 0; i < _settings.row; i++)
					_temp.push (settings.data[i]);
				// Push in between
				for (var i = 0; i < _settings.data.length; i++)
					_temp.push (_settings.data[i]);
				// Push after
				for (var i = _settings.row; i < settings.data.length; i++) {
					_temp.push (settings.data[i]);
				}

				// Assign to table data
				this.data = settings.data = _temp;

				// Draw new data to HTML
				this.draw ();

				// Call the callback
				_settings.done (this.data);
			}

			// Draw table to HTML
			this.draw ();

			// Call the callback
			this.done (this.data);
		});

		// Return the elements
		return this;
	}

	$.fn.tablesearch = function (options) {

		// Default Settings
		var defaults = {
				freezeRow: 0,
				freezeCol: 0,
				config: {},
				data: {},
				gap: 1,
				rubber: true,
				done: function (data) {}
			},
			settings = $.extend({}, defaults, options);

		$.fn.table.apply(this, [settings]);

		this.each(function () {
			// Filtering the list
			this._filter = function (elem) {
				var that = this,
					filters = 0,
					table = $(this),
					input = table.find(".flx-rw-hdr input");

				// Only actively search one input
				if (elem) input = elem;

				table.find('.flx-rw-cnt .flx-rw').removeClass ('hide');
				// Search the column that contain the string
				input.each (function () {
					var search = $(this).val ();

					if (search !== "") {
						if (that.highlight) {
							var contains = table.find('.flx-rw-cnt .cl-' + $(this).attr("data-search") + ':contains("' + search + '")'),
								filterText = "";

							contains.find ("span.cnt, span.sub > span").each (function () {
								filterText = this.textContent || this.innerText;
								filterText = filterText.replace(new RegExp(search, 'gi'), '<strong>$&</strong>');
								this.innerHTML = filterText;
							});
						}
						table.find('.flx-rw-cnt .cl-' + $(this).attr("data-search") + ':not(:contains("' + search + '"))').parent ().each (function () {
							table.find('.flx-rw-cnt .rw-' + $(this).attr ("data-row")).addClass ("hide");
						});
					} else {
						if (that.highlight) {
							table.find('.flx-rw-cnt .cl-' + $(this).attr("data-search")).find ("span.cnt, span.sub > span").each (function () {
								if (this.textContent) this.textContent = this.textContent;
								else if (this.innerText) this.innerText = this.innerText;
								else $(this).text ($(this).text());
							});
						}
					}
				});

				// Fix the stripes
				this._stripes ();
			};

			// Helper to make the search input visible
			this._search = function () {
				var that = this;

				// Show the title again if input filter is empty
				$(window).click (function (event) {
					if (!$(event.target).hasClass("search")) {
						$(that).find(".flx-rw-hdr input.onfocus").each (function () {
							if ($(this).val() === "") {
								$(this).removeClass("onfocus").toggle ();
								$(this).siblings (".search").removeClass("onfocus").toggle ();
							}
						});
					}
				});

				// Make sure the input will be focus
				$(that).find(".flx-rw-hdr input").click (function () {
					$(this).focus();
				});

				// Display input filter on title click
				$(that).find(".flx-rw-hdr .search").each (function () {
					$(this).click (function () {
						$(that).find("input").blur ();

						$(this).addClass("onfocus").hide ();
						$(this).siblings ("input").addClass("onfocus").show ().focus ().bind ('input', function () {
							that._filter($(this));
						});
					});
				});
			}

			// Helper to sort
			this._sort = function () {
				var that = this,
					dataHead = [_.first(that.data)];

				$(that).find(".flx-rw-hdr .sort").each (function () {
					$(this).click (function () {
						if ($(this).hasClass("asc")) {
							$(that).find(".flx-rw-hdr .sort").removeClass ("asc desc");
							$(this).addClass("desc");
							// Sort the data DESC
							that.data = dataHead.concat(_.sortBy(_.rest(that.data), parseInt($(this).data("sort"))).reverse());
						} else if ($(this).hasClass("desc")) {
							$(that).find(".flx-rw-hdr .sort").removeClass ("asc desc");
							// Don't Sort
							that.data = that.realdata;
						} else {
							$(that).find(".flx-rw-hdr .sort").removeClass ("asc desc");
							$(this).addClass("asc");
							// Sort the data ASC
							that.data = dataHead.concat(_.sortBy(_.rest(that.data), parseInt($(this).data("sort"))));
						}

						// Only draw the body
						that._drawBody ();

						// Assign fix size
						that._fixsize ();

						// Assign filter again
						that._filter ();
					});
				});
			}

			// Assign the search function
			this._search ();

			// Assign the sort function
			this._sort ();
		});

		// Return the elements
		return this;
	}

	$.extend($.fn.tablesearch, $.fn.table);
}(jQuery, window, document));
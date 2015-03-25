(function ($, window, document) {
	"use strict";

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
			this.gap = settings.gap;
			this.rubber = settings.rubber;
			this.done = settings.done;

			// Helper to draw row and column
			this._draw = function (data, config, startRow, startCol, endRow, endCol, isHead) {
				var html = "";
				var dataAlign = "";
				var content = "";

				data = (!data) ? [] : data;

				if (!data[0]) {
					data[0] = [];
				}

				startRow = (startRow === null)? 0: startRow;
				startCol = (startCol === null)? 0: startCol;
				endRow = (endRow === null)? data.length: endRow;
				endCol = (endCol === null)? data[0].length: endCol;

				for (var indexRow = startRow; indexRow < endRow; indexRow++) {
					var arraySubValue = [],
						indexesSubValue = [],
						dataAlign = "";

					// Draw one row
					html += '<div class="flx-rw rw-' + indexRow + '" data-row="' + indexRow + '">';
					for (var indexCol = startCol; indexCol < endCol; indexCol++) {
						var dataRowCol = data[indexRow][indexCol];

						// Only display non zero width content
						if (config.width[indexCol] !== "0") {
							dataAlign = "";
							if (typeof config.align[indexCol] === "function") {
								dataAlign += (config.align[indexCol](dataRowCol)[0] + " ");
							} else {
								if (config.align[indexCol] === "left")
									dataAlign += "flx-cl-lf ";
								if (config.align[indexCol] === "right")
									dataAlign += "flx-cl-rg ";
								if (config.align[indexCol] === "center")
									dataAlign += "flx-cl-ct ";
							}

							// Check if the config says that it have sub value
							if (config.width[indexCol].indexOf ("/") < 0) {
								if (isHead === true) {
									html += '<div class="cl-' + indexCol + ' flx-cl ' + dataAlign + '" style="width:' + config.width[indexCol] + 'px">';
										if (config.find[indexCol]) {
											html += '<span class="search">' + dataRowCol + '</span>';
											html += '<input type="text" data-search="' + indexCol + '" style="display:none" placeholder="' + dataRowCol + '" />';
										} else {
											html += '<span>' + dataRowCol + '</span>';
										}

										if (config.sort[indexCol]) {
											html += '<span class="sort" data-sort="' + indexCol + '">&nbsp;</span>';
										}
									html += '</div>';
								} else {
									html += '<div class="cl-' + indexCol + ' flx-cl ' + dataAlign + '" style="width:' + config.width[indexCol] + 'px"><span>' + dataRowCol + '<span></div>';
								}
							} else {
								arraySubValue = config.width[indexCol].split ("/");
								indexesSubValue = arraySubValue[1].split (":");

								if (isHead === true) {
									html += '<div class="cl-' + indexCol + ' flx-cl flx-cl-mr ' + dataAlign + '" style="width:' + arraySubValue[0] + 'px">';
										if (config.find[indexCol]) {
											html += '<span class="search">' + dataRowCol + '</span>';
											html += '<input data-search="' + indexCol + '" type="text" style="display:none" placeholder="' + dataRowCol + '" />';
										} else {
											html += '<span>' + dataRowCol + '</span>';
										}

										if (config.sort[indexCol]) {
											html += '<span class="sort" data-sort="' + indexCol + '">&nbsp;</span>';
										}

										html += '<span class="sub">';
											for (var i = 0; i < indexesSubValue.length; i++) {
												html += '<span class="cl-' + indexesSubValue[i] + '">' + data[indexRow][indexesSubValue[i]] + '</span>';
											}
										html += '</span>';
									html += '</div>';
								} else {
									html += '<div class="cl-' + indexCol + ' flx-cl flx-cl-mr ' + dataAlign + '" style="width:' + arraySubValue[0] + 'px">';
										html += '<span>' + dataRowCol + '</span>';
										html += '<span class="sub">';
											for (var i = 0; i < indexesSubValue.length; i++) {
												html += '<span class="cl-' + indexesSubValue[i] + '">' + data[indexRow][indexesSubValue[i]] + '</span>';
											}
										html += '</span>';
									html += '</div>';
								}
							}
						}
					}
					html += '</div>';
				}

				return html;
			}

			// Helper to make the row and column have fix width and height
			this._fixsize = function () {
				var left = 0,
					top = 0,
					width = 0,
					height = 0,
					col = this.freezeCol,
					row = this.freezeRow,
					id = this.id;

				// Set height of the header row so it will have the same row height
				$("#" + id + " .flx-tprg .flx-rw").each(function (index) {
					var height = $("#" + id + " .flx-tprg .rw-" + index).height (),
						heightlf = $("#" + id + " .flx-tplf .rw-" + index).height ();

					if (heightlf > height)
						height = heightlf;

					$("#" + id + " .flx-rw-hdr .rw-" + index).css ("height", height);
				});

				// Get the top and left freeze points
				top = $("#" + id + " .flx-tplf").height ();
				left = $("#" + id + " .flx-tplf").width ();

				$("#" + id + " .flx-rw-hdr").css ({
					"height": top
				});
				$("#" + id + " .flx-tplf").css ({
					"height": top,
					"width": left
				});
				$("#" + id + " .flx-tprg").css({
					"height": top,
					"left": left + this.gap,
					"right": 0
				});

				// Set height of the content row so it will have the same row height
				$("#" + id + " .flx-btrg .flx-rw").each(function (index) {
					index = index + row;

					var height = $("#" + id + " .flx-btrg .rw-" + index).height (),
						heightlf = $("#" + id + " .flx-btlf .rw-" + index).height ();

					if (heightlf > height)
						height = heightlf;

					$("#" + id + " .flx-rw-cnt .rw-" + index).css ("height", height);
				});

				// Make the bottom left and bottom right content to have fix width and height
				height = $("#" + id + " .flx-btlf").height ();
				$("#" + id + " .flx-btlf").css ({
					"width": left,
					"left": 0
				});
				$("#" + id + " .flx-btrg").css ({
					"left": left + this.gap,
					"right": 0
				});

				$("#" + id + " .tbl-scrl-ver").css ({
					"top": top + this.gap,
					"bottom": 0,
					"left": 0,
					"right": 0
				});

				// Make the scroll area the exact width as the content
				$("#" + id + " .flx-btrg > div > div").css("position", "absolute").each (function () {
					width = parseInt($(this).width ());
				}).css("position", "");
				$("#" + id + " .flx-btrg > div").css ({
					"width": width
				});
				$("#" + id + " .flx-tprg > div").css ({
					"width": width
				});
			}

			// Helper to add odd and event to row
			this._stripes = function () {
				$(this).find (".flx-rw-cnt .flx-rw").removeClass ("odd even");
				$(this).find (".flx-rw-cnt .flx-rw:visible:odd").addClass ("odd");
				$(this).find (".flx-rw-cnt .flx-rw:visible:even").addClass ("even");
			}

			// Filtering the list
			this._filter = function (target) {
				var filters = 0,
					table = $(this);

				table.find('.flx-rw-cnt .flx-rw').removeClass ('hide');
				// Search the column that contain the string
				table.find (".flx-rw-hdr input").each (function () {
					if ($(this).val () !== ""){
						table.find('.flx-rw-cnt .cl-' + $(this).attr("data-search") + ':not(:contains("' + $(this).val () + '"))').parent ().each (function () {
							table.find('.flx-rw-cnt .rw-' + $(this).attr ("data-row")).addClass ("hide");
						});
					}
				});

				this._stripes ();
			};

			// Helper to make the search input visible
			this._search = function () {
				var that = this;

				$(window).click (function (event) {
					if (!$(event.target).hasClass ("onfocus"))
						$(".onfocus").removeClass("onfocus").toggle ();
				});

				$(this).find(".flx-rw-hdr .search").each (function () {
					$(this).click (function () {
						$(this).addClass("onfocus").toggle ();
						$(this).siblings ("input").addClass("onfocus").toggle ().focus ().bind ('input', function () {
							that._filter($(this));
						});;
					});
				});
			}

			// Helper to draw the table and add scroll function
			this.draw = function () {
				var html = "";

				// Draw the header
				html += '<div class="flx-rw-hdr">';
					html += '<div class="flx-tplf">';
						html += this._draw (this.data, this.config, 0, 0, this.freezeRow, this.freezeCol, true);
					html += '</div>';
					html += '<div class="flx-tprg tbl-scrl-hor">';
						html += '<div data-twin="hor">';
							html += this._draw (this.data, this.config, 0, this.freezeCol, this.freezeRow, null, true);
						html += '</div>';
					html += '</div>';
					html += '<div class="clear"></div>';
				html += '</div>';

				// Draw the content
				html += '<div class="flx-rw-cnt tbl-scrl-ver">';
					html += '<div class="scroll">';
						html += '<div class="flx-btlf">';
							html += this._draw (this.data, this.config, this.freezeRow, 0, null, this.freezeCol, false);
						html += '</div>';
						html += '<div class="flx-btrg tbl-scrl-hor">';
							html += '<div data-twin="hor">';
								html += this._draw (this.data, this.config, this.freezeRow, this.freezeCol, null, null, false);
							html += '</div>';
						html += '</div>';
						html += '<div class="clear"></div>';
					html += '</div>';
				html += '</div>';

				// Put it to the HTML
				$(this).addClass ("flx-tbl").attr ("id", this.id).html (html);

				// Apply odd and even
				this._stripes ();

				// Make the column and row fixed size
				this._fixsize ();

				this._search ();

				// Call the scroller, only once to save CPU cycle
				$(this).find (".tbl-scrl-hor > div").scroll ({
					scrollVertical: false,
					scrollHorizontal: true,
					rubber: this.rubber
				});
				$(this).find (".tbl-scrl-ver > div").scroll ({
					scrollVertical: true,
					scrollHorizontal: false,
					rubber: this.rubber
				});

				// Counts
				this.end = new Date().getTime();
				console.log ("It tooks " + (this.end - this.start) + " seconds to generate");

				// Call the callback
				this.done (this.data);
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
		});

		// Return the first element, because event if they are more than one, the data should be the same
		return this;
	}
}(jQuery, window, document));
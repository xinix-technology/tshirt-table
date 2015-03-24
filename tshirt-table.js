(function ($, window, document) {
	"use strict";

	$.fn.table = function (options) {
		// Default Settings
		var defaults = {
				freezeRow: 0,
				freezeCol: 0,
				config: {},
				data: {},
				gap: 1,
				rubber: true
			},
			settings = $.extend({}, defaults, options);

		this.each(function () {
			// Table have the same config settings
			this.id = "table-" + new Date().getTime();
			this.freezeRow = settings.freezeRow;
			this.freezeCol = settings.freezeCol;
			this.config = settings.config;
			this.data = settings.data;
			this.gap = settings.gap;
			this.rubber = settings.rubber;

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

					html += '<div class="flx-rw rw-' + indexRow + '">';
					for (var indexCol = startCol; indexCol < endCol; indexCol++) {
						var sortAble = true,
							dataRowCol = data[indexRow][indexCol];

						// If config says it's 0, then don't display it
						if (config.width[indexCol] != "0") {
							dataAlign = "";
							if (typeof config.align[indexCol] === "function") {
								dataAlign += config.align[indexCol](dataRowCol)[0];
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
								content = "";
								if (config.align[indexCol] === "icon") {
									sortAble = false;
									content = '<i class="icons pos-' + dataRowCol + '" />';
								} else if ((config.align[indexCol] === "saverity") && (startRow !== startCol)) {
									sortAble = false;
									content = '<i class="status status-' + dataRowCol + '" />';
								} else if (config.align[indexCol] === "status" && indexRow != 0) {
									for (var indexColStatus = 0; indexColStatus < dataRowCol.length; indexColStatus++) {
										if (dataRowCol[indexColStatus] === 1) content += '<i class="statuses pos-' + indexColStatus + '" />';
									}
								} else {
									content = dataRowCol;
								}

								if (isHead === true && sortAble === true) {
									html += '<div class="cl-' + indexCol + ' flx-cl ' + dataAlign + ' thisIsHead data-' + indexCol + '" style="width:' + config.width[indexCol] + 'px">';
										// readonly
										html += '<span class="clickToSearch" bindIndex="' + indexCol + '" bindTo="' + dataRowCol + '">' + content + '</span>';
										html += '<span class="clickToSort" sortIndex="' + indexCol + '" sortBy="' + dataRowCol + '">&nbsp;</span>';
										// hidden input
										html += '<input type="text" class="searchBar searchFor' + dataRowCol + '" bindIndex="' + indexCol + '" bindTo="' + dataRowCol + '" style="display:none" />';
									html += '</div>';
								} else {
									html += '<div class="cl-' + indexCol + ' flx-cl ' + dataAlign + ' data-' + indexCol + '" style="width:' + config.width[indexCol] + 'px"><span>' + content + '<span></div>';
								}
							} else {
								arraySubValue = config.width[indexCol].split ("/");
								indexesSubValue = arraySubValue[1].split (":");

								html += '<div class="cl-' + indexCol + ' flx-cl flx-cl-mr" style="width:' + arraySubValue[0] + '"><span class="data-' + indexCol + '">' + dataRowCol + '</span><span class="sub">';
								for (var i = 0; i < indexesSubValue.length; i++) {
									html += '<span class="data-' + indexesSubValue[i] + '">' + data[indexRow][indexesSubValue[i]] + '</span>';
								}
								html += '</span>';
								html += '</div>';
							}
						}
					}
					html += '</div>';
				}

				return html;
			}

			// Push new data to table
			this.push = function (_options) {
				// Default Settings
				var _defaults = {
						row: true,
						data: [],
						done: function (data) {}
					},
					_split = [],
					_temp = [],
					_settings = $.extend({}, _defaults, _options);

				if (_settings.row)
					_settings.row = settings.data.length;
				else {
					_settings.row--;
					if (_settings.row > settings.data.length)
						_settings.row = settings.data.length;
					else
						_settings.row = 0;
				}

				_temp = [];

				// Push before array
				for (var i = 0; i < _settings.row; i++)
					_temp.push (settings.data[i]);
				// Push in between array
				for (var i = 0; i < _settings.data.length; i++)
					_temp.push (_settings.data[i]);
				// Push after array
				for (var i = _settings.row; i < settings.data.length; i++) {
					_temp.push (settings.data[i]);
				}

				// Assign to table data
				this.data = settings.data = _temp;

				_settings.done (_temp);
			}

			this.draw = function () {
				var html = "",
					left = 0,
					top = 0,
					width = 0,
					height = 0,
					col = this.freezeCol,
					row = this.freezeRow,
					id = this.id;

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
					html += '</div>';
				html += '</div>';

				// Put it to the HTML
				$(this).addClass ("flx-tbl").attr ("id", this.id).html (html);

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
					"height": height + this.gap,
					"left": 0
				});
				$("#" + id + " .flx-btrg").css ({
					"height": height + this.gap,
					"left": left + this.gap,
					"right": 0
				});

				$("#" + id + " .tbl-scrl-ver").css ({
					"top": top + this.gap,
					"bottom": 0,
					"left": 0,
					"right": 0
				});
				$("#" + id + " .tbl-scrl-ver .scroll").css ({
					"height": height
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

				// Call the scroller
				$("#" + id + " .tbl-scrl-hor > div").scroll ({
					scrollVertical: false,
					scrollHorizontal: true,
					rubber: this.rubber
				});
				$("#" + id + " .tbl-scrl-ver > div").scroll ({
					scrollVertical: true,
					scrollHorizontal: false,
					rubber: this.rubber
				});
			}

			this.draw ();
		});

		// Return the first element, because event if they are more than one, the data should be the same
		return $(this);
	}
}(jQuery, window, document));
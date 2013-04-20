function MazeCell(top, right, bottom, left, x, y) {
	this.top = top;
	this.right = right;
	this.bottom = bottom;
	this.left = left;

	this.x = x;
	this.y = y;

	/**
	 * Nur für den Erstellungsprozess.
	 */

	//Grenze zu anliegendem Feld
	this.frontier = false;

	//Bereits besucht
	this.visited = false;

	/**
	 * Kreide
	 */
	this.chalked = false;

	/**
	 * Faden
	 */
	this.string = false;
}

var Maze = Backbone.Model.extend({
	defaults: {
		element: null, //Canvas Element
		context: null, //Canvas
		squareSize: null, //Größe der Quadrate in Pixeln, wird automatisch berechnet

		/**
		 * Aktueller Status des Labyrinths:
		 *
		 * - start: Das Labyrinth läuft automatisch (random|backtracking) oder der Spieler kann laufen
		 * - step: Einen Zug weiter gehen
		 * - stop: Nichts kann mehr passieren
		 * - reset: Das Labyrinth wurde zurückgesetzt
		 * - finish: Die Figur ist im Ziel
		 * 
		 * @type string
		 */
		status: 'reset',
		type: 'manual', //random | manual | backtracking

		/**
		 * Layout.
		 */
		colorBackground: 'rgb(255, 255, 255)',
		colorTorchBackground: 'rgb(50, 50, 50)',
		colorWall: 'rgb(255, 255, 255)',
		colorExit: 'rgb(175, 255, 175)',
		colorPlayer: 'rgb(255, 50, 50)',
		colorChalk: 'rgb(170, 170, 210)',
		colorString: 'rgb(0, 0, 0)',

		wallWidth: 0.5,

		/**
		 * Optionen.
		 */
		rowCount: 20, //Anzahl an Zeilen und Spalten
		torch: false, //Held trägt Fakel
		string: false, //Adriane Faden
		chalk: false, //Besuchte Felder mit Kreide markieren
		stack: false, //False oder ein StackDisplay Object
		speed: 150, //Laufgeschwindigkeit in Millisekunden

		squares: [], //Mehrdimensionales Array mit den Koordinaten des Spielfelds
		player: [0, 0], //Position des Spielers
		end: [0, 0], //Ziel
		stackFrom: '', //Letzte Richtung

		selectorStart: false,
		selectorStep: false,
		selectorStop: false,
		selectorReset: false,

		keyUp: 38, //Pfeil oben
		keyRight: 39, //Pfeil rechts
		keyDown: 40, //Pfeil unten
		keyLeft: 37 //Pfeil links
	},

	createEnd: function() {
		var side = _.random(0, 3);
		var squares = this.get('squares');
		var rowCount = this.get('rowCount');
		var end = this.get('end');
		var x = 0;
		var y = 0;

		switch (side) {
			case 0:
				//Top
				x = _.random(1, rowCount - 2);
				y = 0;
				squares[x][y].top = false;
				this.setFrontiers(x, y);
				break;
			case 1:
				//Right
				x = rowCount - 1;
				y = _.random(1, rowCount - 2);
				squares[x][y].right = false;
				this.setFrontiers(x, y);
				break;
			case 2:
				//Bottom
				x = _.random(1, rowCount - 2);
				y = rowCount - 1;
				squares[x][y].bottom = false;
				this.setFrontiers(x, y);
				break;
			case 3:
				//Left
				x = 0;
				y = _.random(1, rowCount - 2);
				squares[x][y].left = false;
				this.setFrontiers(x, y);
				break;
		}

		end[0] = x;
		end[1] = y;
	},

	dig: function(x, y) {
		var sides = _.shuffle([0, 1, 2, 3]);
		var squares = this.get('squares');
		var rowCount = this.get('rowCount');

		for (var i = 0; i < 4; i++) {
			switch (sides[i]) {
				case 0:
					//Top
					if ((y - 1) >= 0 && squares[x][y - 1].visited === false) {
						squares[x][y - 1].bottom = false;
						squares[x][y].top = false;

						return squares[x][y - 1];
					}
					break;
				case 1:
					//Right
					if ((x + 1) < rowCount && squares[x + 1][y].visited === false) {
						squares[x + 1][y].left = false;
						squares[x][y].right = false;

						return squares[x + 1][y];
					}
					break;
				case 2:
					//Bottom
					if ((y + 1) < rowCount && squares[x][y + 1].visited === false) {
						squares[x][y + 1].top = false;
						squares[x][y].bottom = false;

						return squares[x][y + 1];
					}
					break;
				case 3:
					//Left
					if ((x - 1) >= 0 && squares[x - 1][y].visited === false) {
						squares[x - 1][y].right = false;
						squares[x][y].left = false;

						return squares[x - 1][y];
					}
				break;
			}
		}

		return null;
	},

	setFrontiers: function(x, y) {
		var squares = this.get('squares');

		if (squares[x + 1] && squares[x + 1][y].visited === false)
			squares[x + 1][y].frontier = true;
		if (squares[x - 1] && squares[x - 1][y].visited === false)
			squares[x - 1][y].frontier = true;
		if (squares[x][y + 1] && squares[x][y + 1].visited === false)
			squares[x][y + 1].frontier = true;
		if (squares[x][y - 1] && squares[x][y - 1].visited === false)
			squares[x][y - 1].frontier = true;
	},

	getFrontiers: function() {
		var frontiers = [];
		var squares = this.get('squares');
		var rowCount = this.get('rowCount');

		for (var x = 0; x < rowCount; x++) {
			for (var y = 0; y < rowCount; y++) {
				if (squares[x][y].frontier === true) {
					frontiers.push(squares[x][y]);
				}
			}
		}

		return frontiers;
	},

	fillMaze: function(frontiers) {
		if (frontiers.length > 0) {
			var neighbor = frontiers.shift();
			var squares = this.get('squares');

			this.dig(neighbor.x, neighbor.y);
			this.setFrontiers(neighbor.x, neighbor.y);
			squares[neighbor.x][neighbor.y].visited = true;
			squares[neighbor.x][neighbor.y].frontier = false;

			this.fillMaze(this.getFrontiers());
		}
	},

	createMaze: function() {
		this.createEnd();

		//console.profile('Create maze');
		this.fillMaze(this.getFrontiers());
		//console.profileEnd('Create maze');
	},

	setPlayer: function() {
		var pos = Math.round(this.get('rowCount') / 2);
		this.set({
			player: [pos, pos]
		});
	},

	drawWall: function(xFrom, yFrom, xTo, yTo) {
		var context = this.get('context');
		var squareSize = this.get('squareSize');

		context.beginPath();
		context.moveTo(xFrom * squareSize, yFrom * squareSize);
		context.lineTo(xTo * squareSize, yTo * squareSize);
		context.closePath();
		context.stroke();
	},

	drawField: function(x, y, exit) {
		var context = this.get('context');
		var chalk = this.get('chalk');
		var squares = this.get('squares');
		var squareSize = this.get('squareSize');
		var colorChalk = this.get('colorChalk');
		var colorBackground = this.get('colorBackground');
		var colorString = this.get('colorString');
		var colorExit = this.get('colorExit');

		if (exit === false) {
			if (chalk === true && squares[x][y].chalked === true) {
				context.fillStyle = colorChalk;
			} else {
				context.fillStyle = colorBackground;
			}
		} else {
			context.fillStyle = colorExit;
		}

		context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);

		if (squares[x][y].string === true) {
			context.beginPath();
			context.arc(
				(x * squareSize) + (squareSize / 2),
				(y * squareSize) + (squareSize / 2),
				squareSize / 3,
				0,
				2 * Math.PI
			);
			context.fillStyle = colorString;
			context.fill();
			context.closePath();
		}
	},

	drawPlayer: function(x, y, color) {
		var context = this.get('context');
		var squareSize = this.get('squareSize');

		context.beginPath();
		context.arc(
			(x * squareSize) + (squareSize / 2),
			(y * squareSize) + (squareSize / 2),
			squareSize / 3,
			0,
			2 * Math.PI
		);
		context.fillStyle = color;
		context.fill();
		context.closePath();
	},

	draw: function() {
		var context = this.get('context');
		var torch = this.get('torch');
		var status = this.get('status');
		var element = this.get('element');
		var squares = this.get('squares');
		var rowCount = this.get('rowCount');
		var end = this.get('end');
		var wallWidth = this.get('wallWidth');
		var player = this.get('player');
		var squareSize = this.get('squareSize');
		var colorTorchBackground = this.get('colorTorchBackground');
		var colorPlayer = this.get('colorPlayer');
		var colorBackground = this.get('colorBackground');
		var colorWall = this.get('colorWall');

		if (torch === true && status !== 'finish') {
			context.fillStyle = colorTorchBackground;
			context.fillRect(0, 0, element.width, element.height);
			context.save();

			context.beginPath();
			context.arc(
				player[0] * squareSize,
				player[1] * squareSize,
				(squareSize * rowCount / 7),
				0,
				2 * Math.PI
			);
			context.clip();
		}

		context.beginPath();
		context.fillStyle = colorBackground;
		context.fillRect(0, 0, element.width, element.height);

		context.fillStyle = colorWall;
		context.lineWidth = wallWidth;

		for (var x = 0; x < rowCount; x++) {
			for (var y = 0; y < rowCount; y++) {
				if (x === end[0] && y === end[1]) {
					this.drawField(x, y, true);
				} else {
					this.drawField(x, y, false);
				}

				if (squares[x][y].top === true)
					this.drawWall(x, y, x + 1, y);

				if (squares[x][y].right === true)
					this.drawWall(x + 1, y, x + 1, y + 1);

				if (squares[x][y].bottom === true)
					this.drawWall(x, y + 1, x + 1, y + 1);

				if (squares[x][y].left === true)
					this.drawWall(x, y, x, y + 1);
			}
		}

		this.drawPlayer(player[0], player[1], colorPlayer);

		if (torch === true && status !== 'finish') {
			context.restore();
		}
	},

	firstWalk: function(x, y) {
		var squares = this.get('squares');

		if (squares[x][y - 1].bottom === false)
			return [x, y - 1, 'up'];

		if (squares[x + 1][y].left === false)
			return [x + 1, y, 'right'];

		if (squares[x][y + 1].top === false)
			return [x, y + 1, 'down'];

		if (squares[x - 1][y].right === false)
			return [x - 1, y, 'left'];

		return false;
	},

	canWalkTo: function(x, y, to) {
		var squares = this.get('squares');

		switch (to) {
			case 'up':
				if (squares[x][y - 1] && squares[x][y - 1].bottom === false) {
					return [x, y - 1, 'up'];
				}
				break;
			case 'right':
				if (squares[x + 1] && squares[x + 1][y].left === false) {
					return [x + 1, y, 'right'];
				}
				break;
			case 'down':
				if (squares[x][y + 1] && squares[x][y + 1].top === false) {
					return [x, y + 1, 'down'];
				}
				break;
			case 'left':
				if (squares[x - 1] && squares[x - 1][y].right === false) {
					return [x - 1, y, 'left'];
				}
				break;
		}

		return false;
	},

	chalked: function(x, y, to) {
		var squares = this.get('squares');

		switch (to) {
			case 'up':
				if (squares[x][y - 1]) {
					return squares[x][y - 1].chalked;
				}
				break;
			case 'right':
				if (squares[x + 1]) {
					return squares[x + 1][y].chalked;
				}
				break;
			case 'down':
				if (squares[x][y + 1]) {
					return squares[x][y + 1].chalked;
				}
				break;
			case 'left':
				if (squares[x - 1]) {
					return  squares[x - 1][y].chalked;
				}
				break;
		}

		return false;
	},

	stringed: function(x, y, to) {
		var squares = this.get('squares');

		switch (to) {
			case 'up':
				if (squares[x][y - 1]) {
					return squares[x][y - 1].string;
				}
				break;
			case 'right':
				if (squares[x + 1]) {
					return squares[x + 1][y].string;
				}
				break;
			case 'down':
				if (squares[x][y + 1]) {
					return squares[x][y + 1].string;
				}
				break;
			case 'left':
				if (squares[x - 1]) {
					return  squares[x - 1][y].string;
				}
				break;
		}

		return false;
	},

	oppositeDirection: function(to) {
		switch (to) {
			case 'up': return 'down';
			case 'right': return 'left';
			case 'down': return 'up';
			case 'left': return 'right';
		}
	},

	nextRandomWalk: function(x, y, to) {
		var possibilities = [];
		var directions = _.shuffle([0, 1, 2, 3]);
		var i = 0;

		//Möglichkeiten per Zufall durchsuchen
		for (i = 0; i < 4; i++) {
			switch (directions[i]) {
				case 0:
					if (this.canWalkTo(x, y, 'up'))
						possibilities.push([x, y - 1, 'up']);
					break;
				case 1:
					if (this.canWalkTo(x, y, 'right'))
						possibilities.push([x + 1, y, 'right']);
					break;
				case 2:
					if (this.canWalkTo(x, y, 'down'))
						possibilities.push([x, y + 1, 'down']);
					break;
				case 3:
					if (this.canWalkTo(x, y, 'left'))
						possibilities.push([x - 1, y, 'left']);
					break;
			}
		}

		//Falls Möglichkeit in die gleiche Richtung zu laufen
		for (i = 0; i < possibilities.length; i++) {
			if (possibilities[i][2] !== this.oppositeDirection(to))
				return possibilities[i];
		}

		//Gehe in die erstbeste Richtung
		if (possibilities.length > 0)
			return possibilities[0];
		else
			return false;
	},

	walkRandom: function(to) {
		if (this.get('status') === 'start') {
			var _this = this;
			var next = false;
			var player = this.get('player');
			var end = this.get('end');
			var squares = this.get('squares');

			if (player[0] === end[0] && player[1] === end[1]) {
				this.finish();
				return;
			}

			//Walk
			if (!to) {
				next = this.firstWalk(player[0], player[1]);
			} else {
				next = this.nextRandomWalk(player[0], player[1], to);
			}

			if (next !== false) {
				this.set({
					player: [next[0], next[1]]
				});

				if (this.get('chalk')) {
					squares[next[0]][next[1]].chalked = true;
				}

				this.draw();
			} else {
				return;
			}

			setTimeout(function() {
				_this.walkRandom(next[2]);
			}, this.get('speed'));
		} else {
			return;
		}
	},

	/**
	 * Das Labyrinth per Backtracking lösen.
	 * 
	 * Das Backtracking ist nur simuliert da JavaScript kein echtes sleep() bietet.
	 */
	walkBacktracking: function() {
		if (this.get('status') === 'start' || this.get('status') === 'step') {
			var _this = this;
			var next = false;
			var x = this.get('player')[0];
			var y = this.get('player')[1];
			var string = false;
			var end = this.get('end');
			var squares = this.get('squares');
			var m = [];

			//Ziel
			if (x === end[0] && y === end[1]) {
				this.finish();
				return;
			}

			//Freies Feld
			if (next === false && this.canWalkTo(x, y, 'right') !== false && this.chalked(x, y, 'right') === false)
				next = [x + 1, y, 'right'];

			if (next === false && this.canWalkTo(x, y, 'up') !== false && this.chalked(x, y, 'up') === false)
				next = [x, y - 1, 'up'];

			if (next === false && this.canWalkTo(x, y, 'left') !== false && this.chalked(x, y, 'left') === false)
				next = [x - 1, y, 'left'];

			if (next === false && this.canWalkTo(x, y, 'down') !== false && this.chalked(x, y, 'down') === false)
				next = [x, y + 1, 'down'];

			if (next !== false) {
				string = true;
			} else {
				//Zurück
				if (next === false && this.canWalkTo(x, y, 'right') !== false && this.stringed(x, y, 'right') === true)
					next = [x + 1, y, 'right'];

				if (next === false && this.canWalkTo(x, y, 'up') !== false && this.stringed(x, y, 'up') === true)
					next = [x, y - 1, 'up'];

				if (next === false && this.canWalkTo(x, y, 'left') !== false && this.stringed(x, y, 'left') === true)
					next = [x - 1, y, 'left'];

				if (next === false && this.canWalkTo(x, y, 'down') !== false && this.stringed(x, y, 'down') === true)
					next = [x, y + 1, 'down'];

				if (next === false) {
					//Start
					if (next === false && this.canWalkTo(x, y, 'right') !== false)
						next = [x + 1, y, 'right'];

					if (next === false && this.canWalkTo(x, y, 'up') !== false)
						next = [x, y - 1, 'up'];

					if (next === false && this.canWalkTo(x, y, 'left') !== false)
						next = [x - 1, y, 'left'];

					if (next === false && this.canWalkTo(x, y, 'down') !== false)
						next = [x, y + 1, 'down'];

					if (next !== false) {
						string = true;
					}
				}
			}

			if (next === false)
				return;

			//Ermittel Möglichke Richtungen M
			if (this.canWalkTo(next[0], next[1], 'right') !== false)
				m.push('right');

			if (this.canWalkTo(next[0], next[1], 'up') !== false)
				m.push('up');

			if (this.canWalkTo(next[0], next[1], 'left') !== false)
				m.push('left');

			if (this.canWalkTo(next[0], next[1], 'down') !== false)
				m.push('down');

			if (string === true) {
				//Setze Faden
				squares[next[0]][next[1]].string = true;

				//Füge neues Element zu dem Stack hinzu
				if (this.get('stack') !== false) {
					this.get('stack').push({
						m: m,
						x: next[2]
					});
				}
			} else {
				//Entferne Faden von dem alten Feld
				squares[x][y].string = false;

				if (this.get('stack') !== false) {
					//Lösche letztes Element aus dem Stack
					this.get('stack').pop();
					this.get('stack').removeDirection(this.oppositeDirection(next[2]));
				}
			}

			//Nächstes Feld mit Kreide markieren
			if (this.get('chalk')) {
				squares[next[0]][next[1]].chalked = true;
			}

			//Neue Spielerposition
			this.set({
				player: [next[0], next[1]]
			});

			this.draw();

			if (this.get('status') === 'start') {
				setTimeout(function() {
					_this.walkBacktracking();
				}, this.get('speed'));
			}
		}

		return;
	},

	walk: function(direction) {
		var player = this.get('player');
		var end = this.get('end');
		var squares = this.get('squares');
		var canWalk = false;
		var x = player[0];
		var y = player[1];

		var xNext = false;
		var yNext = false;

		if (x === end[0] && y === end[1]) {
			this.finish();
			return;
		}

		switch (direction) {
			case 'up':
				if (squares[x][y - 1] && squares[x][y].top === false) {
					xNext = x;
					yNext = y - 1;
					canWalk = true;
				}

				break;
			case 'right':
				if (squares[x + 1] && squares[x + 1][y] && squares[x][y].right === false) {
					xNext = x + 1;
					yNext = y;
					canWalk = true;
				}

				break;
			case 'down':
				if (squares[x][y + 1] && squares[x][y].bottom === false) {
					xNext = x;
					yNext = y + 1;
					canWalk = true;
				}

				break;
			case 'left':
				if (squares[x - 1] && squares[x - 1][y] && squares[x][y].left === false) {
					xNext = x - 1;
					yNext = y;
					canWalk = true;
				}

				break;
		}

		if (canWalk) {
			this.trigger('walk', [this, xNext, yNext]);

			player[0] = xNext;
			player[1] = yNext;

			if (this.get('chalk')) {
				squares[xNext][yNext].chalked = true;
			}

			if (this.get('string')) {
				if (this.stringed(x, y, direction)) {
					squares[x][y].string = false;
				}

				squares[xNext][yNext].string = true;
			}

			this.draw();
		}

		return canWalk;
	},

	walkUp: function() {
		this.walk('up');
	},

	walkRight: function() {
		this.walk('right');
	},

	walkDown: function() {
		this.walk('down');
	},

	walkLeft: function() {
		this.walk('left');
	},

	start: function() {
		var _this = this;

		if (this.get('status') !== 'start') {
			switch (this.get('type')) {
				case 'random':
					this.trigger('start', this);

					this.set({
						status: 'start'
					});
					this.walkRandom(null);
					break;
				case 'manual':
					this.trigger('start', this);

					Mazes.stopAll();

					this.set({
						status: 'start'
					});

					$('body').keydown(function(e) {
						switch (e.keyCode) {
							case _this.get('keyUp'):
								_this.walkUp();
								break;
							case _this.get('keyRight'):
								_this.walkRight();
								break;
							case _this.get('keyDown'):
								_this.walkDown();
								break;
							case _this.get('keyLeft'):
								_this.walkLeft();
								break;
						}

						if (e.keyCode === _this.get('keyUp') ||
							e.keyCode === _this.get('keyRight') ||
							e.keyCode === _this.get('keyDown') ||
							e.keyCode === _this.get('keyLeft')) {

							e.preventDefault();
							return false;
						}
					});
					break;
				case 'backtracking':
					this.trigger('start', this);

					this.set({
						status: 'start'
					});

					this.walkBacktracking();
					break;
			}

			if (this.get('selectorStart'))
				$(this.get('selectorStart')).addClass('disabled');

			if (this.get('selectorStep'))
				$(this.get('selectorStep')).addClass('disabled');

			if (this.get('selectorStop'))
				$(this.get('selectorStop')).removeClass('disabled');
		}
	},

	step: function() {
		if (this.get('status') !== 'start') {
			this.trigger('step', this);

			this.set({
				status: 'step'
			});

			this.walkBacktracking();
		}
	},

	finish: function() {
		this.trigger('finish', this);

		this.set({
			status: 'finish'
		});

		this.draw();
		Mazes.unbindKeys();
	},

	stop: function() {
		if (this.get('status') !== 'stop') {
			this.trigger('stop', this);

			this.set({
				status: 'stop'
			});

			Mazes.unbindKeys();

			if (this.get('selectorStart'))
				$(this.get('selectorStart')).removeClass('disabled');

			if (this.get('selectorStep'))
				$(this.get('selectorStep')).removeClass('disabled');

			if (this.get('selectorStop'))
				$(this.get('selectorStop')).addClass('disabled');
		}
	},

	reset: function() {
		if (this.get('status') !== 'reset') {
			this.trigger('reset', this);

			this.initialize();
			this.set({
				status: 'reset'
			});

			if (this.get('selectorStart'))
				$(this.get('selectorStart')).removeClass('disabled');

			if (this.get('selectorStep'))
				$(this.get('selectorStep')).removeClass('disabled');

			if (this.get('selectorStop'))
				$(this.get('selectorStop')).addClass('disabled');
		}
	},

	init: function() {
		var _this = this;
		var top = true;
		var right = true;
		var bottom = true;
		var left = true;
		var squares = this.get('squares');
		var element = this.get('element');
		var rowCount = this.get('rowCount');

		this.set({
			context: element.getContext('2d')
		});

		element.width = $(element).parent().width();
		element.height = $(element).width();

		this.set({
			squareSize: (element.width / rowCount)
		});

		//Init fields
		squares = [];
		for (var x = 0; x < rowCount; x++) {
			squares[x] = [];
			for (var y = 0; y < rowCount; y++) {
				squares[x][y] = new MazeCell(true, true, true, true, x, y);
			}
		}

		this.set({
			squares: squares
		});

		this.setPlayer();
		this.createMaze();

		this.draw();
	},

	initialize: function() {
		var _this = this;

		this.init();

		//Set controls
		if (this.get('selectorStart') !== false) {
			$(this.get('selectorStart')).on('click', function() {
				_this.start();
			});
		}

		if (this.get('selectorStep') !== false) {
			$(this.get('selectorStep')).on('click', function() {
				_this.step();
			});
		}

		if (this.get('selectorStop') !== false) {
			$(this.get('selectorStop')).on('click', function() {
				_this.stop();
			});
		}

		if (this.get('selectorReset') !== false) {
			$(this.get('selectorReset')).on('click', function() {
				_this.reset();
			});
		}

		this.draw();
	}
});

var MazeController = Backbone.Collection.extend({
	model: Maze,

	initialize: function() {
		console.log('Initialize Maze collection.');

		this.on('start', function(model) {
			console.log('Start maze:', model.id);
		});

		this.on('step', function(model) {
			console.log('Step maze:', model.id);
		});

		this.on('stop', function(model) {
			console.log('Stop maze:', model.id);
		});

		this.on('reset', function(model) {
			console.log('Reset maze:', model.id);
		});

		this.on('finish', function(model) {
			console.log('Finished maze:', model.id);
		});
	},

	stopAll: function() {
		this.forEach(function(model) {
			model.stop();
		});
	},

	unbindKeys: function() {
		$('body').unbind('keydown');
	}
});

var Mazes = new MazeController();

$(function() {
	Mazes.add([
		{
			id: 'random',
			element: $('#experiment-labyrinth-random').get(0),
			rowCount: 20,
			type: 'random',
			selectorStart: '#experiment-labyrinth-random-start',
			selectorStop: '#experiment-labyrinth-random-stop',
			selectorReset: '#experiment-labyrinth-random-reset'
		},
		{
			id: 'manual',
			element: $('#experiment-labyrinth-manual').get(0),
			rowCount: 20,
			type: 'manual',
			torch: true,
			selectorStart: '#experiment-labyrinth-manual-start',
			selectorStop: '#experiment-labyrinth-manual-stop',
			selectorReset: '#experiment-labyrinth-manual-reset'
		},
		{
			id: 'manual-small',
			element: $('#experiment-labyrinth-small').get(0),
			rowCount: 15,
			type: 'manual',
			torch: true,
			selectorStart: '#experiment-labyrinth-small-start',
			selectorStop: '#experiment-labyrinth-small-stop',
			selectorReset: '#experiment-labyrinth-small-reset'
		},
		{
			id: 'chalk',
			element: $('#experiment-labyrinth-chalk').get(0),
			rowCount: 20,
			type: 'manual',
			torch: true,
			chalk: true,
			selectorStart: '#experiment-labyrinth-chalk-start',
			selectorStop: '#experiment-labyrinth-chalk-stop',
			selectorReset: '#experiment-labyrinth-chalk-reset'
		},
		{
			id: 'string',
			element: $('#experiment-labyrinth-string').get(0),
			rowCount: 20,
			type: 'backtracking',
			chalk: true,
			string: true,
			selectorStart: '#experiment-labyrinth-string-start',
			selectorStop: '#experiment-labyrinth-string-stop',
			selectorReset: '#experiment-labyrinth-string-reset'
		},
		{
			id: 'manual-string',
			element: $('#experiment-labyrinth-manual-string').get(0),
			rowCount: 20,
			type: 'manual',
			torch: true,
			chalk: true,
			string: true,
			selectorStart: '#experiment-labyrinth-manual-string-start',
			selectorStop: '#experiment-labyrinth-manual-string-stop',
			selectorReset: '#experiment-labyrinth-manual-string-reset'
		},
		{
			id: 'stack',
			element: $('#experiment-labyrinth-stack').get(0),
			rowCount: 6,
			type: 'backtracking',
			chalk: true,
			string: true,
			stack: new StackDisplay($('#experiment-labyrinth-stack-display').get(0)),
			speed: 1000,
			selectorStart: '#experiment-labyrinth-stack-start',
			selectorStep: '#experiment-labyrinth-stack-step',
			selectorStop: '#experiment-labyrinth-stack-stop',
			selectorReset: '#experiment-labyrinth-stack-reset',
			selectorStack: '#experiment-labyrinth-stack-display',
			selectorAlgorithm: '#experiment-labyrinth-stack-algorithm'
		}
	]);
});
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

var MazeController = {
	mazes: [],

	create: function(element, rowCount, torch, type) {
		var theMaze = new Maze(element, rowCount, torch, type);
		this.mazes.push(theMaze);

		return theMaze;
	},

	stopAll: function() {
		for (var i = 0; i < this.mazes.length; i++) {
			this.mazes[i].stop();
		}
	},

	unbindKeys: function() {
		$('body').unbind('keydown');
	}
};

function Maze(element, rowCount, type) {
	this.element = element;
	this.context = this.element.getContext('2d');

	this.status = 'reset'; //start | stop | reset | finish
	this.type = type; //random | manual | backtracking

	this.element.width = $(this.element).parent().width();
	this.element.height = $(this.element).width();

	/**
	 * Layout.
	 */
	this.colorBackground = 'rgb(255, 255, 255)';
	this.colorTorchBackground = 'rgb(50, 50, 50)';
	this.colorWall = 'rgb(255, 255, 255)';
	this.colorExit = 'rgb(175, 255, 175)';
	this.colorPlayer = 'rgb(255, 50, 50)';
	this.colorChalk = 'rgb(170, 170, 210)';
	this.colorString = 'rgb(0, 0, 0)';

	this.wallWidth = 0.5;

	/**
	 * Optionen.
	 */
	this.rowCount = rowCount;
	this.torch = false;
	this.string = false;
	this.chalk = false;
	this.speed = 150;
	this.squareSize = (element.width / this.rowCount);

	this.squares = [];
	this.player = [0, 0];
	this.end = [0, 0];

	this.selectorStart = false;
	this.selectorStop = false;
	this.selectorReset = false;

	this.keyUp = 38;
	this.keyRight = 39;
	this.keyDown = 40;
	this.keyLeft = 37;

	this.createEnd = function() {
		//x coordinate
		var side = _.random(0, 3);
		var x = 0;
		var y = 0;

		switch (side) {
			case 0:
				//Top
				x = _.random(1, this.rowCount - 2);
				y = 0;
				this.squares[x][y].top = false;
				this.setFrontiers(x, y);
				break;
			case 1:
				//Right
				x = this.rowCount - 1;
				y = _.random(1, this.rowCount - 2);
				this.squares[x][y].right = false;
				this.setFrontiers(x, y);
				break;
			case 2:
				//Bottom
				x = _.random(1, this.rowCount - 2);
				y = this.rowCount - 1;
				this.squares[x][y].bottom = false;
				this.setFrontiers(x, y);
				break;
			case 3:
				//Left
				x = 0;
				y = _.random(1, this.rowCount - 2);
				this.squares[x][y].left = false;
				this.setFrontiers(x, y);
				break;
		}

		this.end[0] = x;
		this.end[1] = y;
	};

	this.dig = function(x, y) {
		var sides = _.shuffle([0, 1, 2, 3]);

		for (var i = 0; i < 4; i++) {
			switch (sides[i]) {
				case 0:
					//Top
					if ((y - 1) >= 0 && this.squares[x][y - 1].visited === false) {
						this.squares[x][y - 1].bottom = false;
						this.squares[x][y].top = false;
						if (y === 0)
							console.log('top');

						return this.squares[x][y - 1];
					}
					break;
				case 1:
					//Right
					if ((x + 1) < this.rowCount && this.squares[x + 1][y].visited === false) {
						if (x === 29)
							console.log('right');
						this.squares[x + 1][y].left = false;
						this.squares[x][y].right = false;

						return this.squares[x + 1][y];
					}
					break;
				case 2:
					//Bottom
					if ((y + 1) < this.rowCount && this.squares[x][y + 1].visited === false) {
						if (y === 29)
							console.log('bottom');
						this.squares[x][y + 1].top = false;
						this.squares[x][y].bottom = false;

						return this.squares[x][y + 1];
					}
					break;
				case 3:
					//Left
					if ((x - 1) >= 0 && this.squares[x - 1][y].visited === false) {
						if (x === 0)
							console.log('left');
						this.squares[x - 1][y].right = false;
						this.squares[x][y].left = false;

						return this.squares[x - 1][y];
					}
				break;
			}
		}

		return null;
	};

	this.setFrontiers = function(x, y) {
		if (this.squares[x + 1] && this.squares[x + 1][y].visited === false)
			this.squares[x + 1][y].frontier = true;
		if (this.squares[x - 1] && this.squares[x - 1][y].visited === false)
			this.squares[x - 1][y].frontier = true;
		if (this.squares[x][y + 1] && this.squares[x][y + 1].visited === false)
			this.squares[x][y + 1].frontier = true;
		if (this.squares[x][y - 1] && this.squares[x][y - 1].visited === false)
			this.squares[x][y - 1].frontier = true;
	};

	this.getFrontiers = function() {
		var frontiers = [];

		for (var x = 0; x < this.rowCount; x++) {
			for (var y = 0; y < this.rowCount; y++) {
				if (this.squares[x][y].frontier === true) {
					frontiers.push(this.squares[x][y]);
				}
			}
		}

		return frontiers;
	};

	this.fillMaze = function(frontiers) {
		if (frontiers.length > 0) {
			var neighbor = frontiers.shift();

			this.dig(neighbor.x, neighbor.y);
			this.setFrontiers(neighbor.x, neighbor.y);
			this.squares[neighbor.x][neighbor.y].visited = true;
			this.squares[neighbor.x][neighbor.y].frontier = false;

			this.fillMaze(this.getFrontiers());
		}
	};

	this.createMaze = function() {
		this.createEnd();

		//console.profile('Create maze');
		this.fillMaze(this.getFrontiers());
		//console.profileEnd('Create maze');
	};

	this.setPlayer = function() {
		var pos = Math.round(this.rowCount / 2);

		this.player = [pos, pos];
	};

	this.drawWall = function(xFrom, yFrom, xTo, yTo) {
		this.context.beginPath();
		this.context.moveTo(xFrom * this.squareSize, yFrom * this.squareSize);
		this.context.lineTo(xTo * this.squareSize, yTo * this.squareSize);
		this.context.closePath();
		this.context.stroke();
	};

	this.drawField = function(x, y, exit) {
		if (exit === false) {
			if (this.chalk === true && this.squares[x][y].chalked === true) {
				this.context.fillStyle = this.colorChalk;
			} else {
				this.context.fillStyle = this.colorBackground;
			}
		} else {
			this.context.fillStyle = this.colorExit;
		}

		this.context.fillRect(x * this.squareSize, y * this.squareSize, this.squareSize, this.squareSize);

		if (this.squares[x][y].string === true) {
			this.context.beginPath();
			this.context.arc(
				(x * this.squareSize) + (this.squareSize / 2),
				(y * this.squareSize) + (this.squareSize / 2),
				this.squareSize / 3,
				0,
				2 * Math.PI
			);
			this.context.fillStyle = this.colorString;
			this.context.fill();
			this.context.closePath();
		}
	};

	this.drawPlayer = function(x, y, color) {
		this.context.beginPath();
		this.context.arc(
			(x * this.squareSize) + (this.squareSize / 2),
			(y * this.squareSize) + (this.squareSize / 2),
			this.squareSize / 3,
			0,
			2 * Math.PI
		);
		this.context.fillStyle = color;
		this.context.fill();
		this.context.closePath();
	};

	this.draw = function() {
		if (this.torch === true && this.status !== 'finish') {
			this.context.fillStyle = this.colorTorchBackground;
			this.context.fillRect(0, 0, element.width, element.height);
			this.context.save();

			this.context.beginPath();
			this.context.arc(
				this.player[0] * this.squareSize,
				this.player[1] * this.squareSize,
				(this.squareSize * this.rowCount / 7),
				0,
				2 * Math.PI
			);
			this.context.clip();
		}

		this.context.beginPath();
		this.context.fillStyle = this.colorBackground;
		this.context.fillRect(0, 0, element.width, element.height);

		this.context.fillStyle = this.colorWall;
		this.context.lineWidth = this.wallWidth;

		for (var x = 0; x < this.rowCount; x++) {
			for (var y = 0; y < this.rowCount; y++) {
				if (x === this.end[0] && y === this.end[1]) {
					this.drawField(x, y, true);
				} else {
					this.drawField(x, y, false);
				}

				if (this.squares[x][y].top === true)
					this.drawWall(x, y, x + 1, y);

				if (this.squares[x][y].right === true)
					this.drawWall(x + 1, y, x + 1, y + 1);

				if (this.squares[x][y].bottom === true)
					this.drawWall(x, y + 1, x + 1, y + 1);

				if (this.squares[x][y].left === true)
					this.drawWall(x, y, x, y + 1);
			}
		}

		this.drawPlayer(this.player[0], this.player[1], this.colorPlayer);

		if (this.torch === true && this.status !== 'finish') {
			this.context.restore();
		}
	};

	this.firstWalk = function(x, y) {
		//Top
		if (this.squares[x][y - 1].bottom === false)
			return [x, y - 1, 'up'];

		//Right
		if (this.squares[x + 1][y].left === false)
			return [x + 1, y, 'right'];

		//Bottom
		if (this.squares[x][y + 1].top === false)
			return [x, y + 1, 'down'];

		//Left
		if (this.squares[x - 1][y].right === false)
			return [x - 1, y, 'left'];

		return false;
	};

	this.canWalkTo = function(x, y, to) {
		switch (to) {
			case 'up':
				if (this.squares[x][y - 1] && this.squares[x][y - 1].bottom === false) {
					return [x, y - 1, 'up'];
				}
				break;
			case 'right':
				if (this.squares[x + 1] && this.squares[x + 1][y].left === false) {
					return [x + 1, y, 'right'];
				}
				break;
			case 'down':
				if (this.squares[x][y + 1] && this.squares[x][y + 1].top === false) {
					return [x, y + 1, 'down'];
				}
				break;
			case 'left':
				if (this.squares[x - 1] && this.squares[x - 1][y].right === false) {
					return [x - 1, y, 'left'];
				}
				break;
		}

		return false;
	};

	this.chalked = function(x, y, to) {
		switch (to) {
			case 'up':
				if (this.squares[x][y - 1]) {
					return this.squares[x][y - 1].chalked;
				}
				break;
			case 'right':
				if (this.squares[x + 1]) {
					return this.squares[x + 1][y].chalked;
				}
				break;
			case 'down':
				if (this.squares[x][y + 1]) {
					return this.squares[x][y + 1].chalked;
				}
				break;
			case 'left':
				if (this.squares[x - 1]) {
					return  this.squares[x - 1][y].chalked;
				}
				break;
		}

		return false;
	};

	this.stringed = function(x, y, to) {
		switch (to) {
			case 'up':
				if (this.squares[x][y - 1]) {
					return this.squares[x][y - 1].string;
				}
				break;
			case 'right':
				if (this.squares[x + 1]) {
					return this.squares[x + 1][y].string;
				}
				break;
			case 'down':
				if (this.squares[x][y + 1]) {
					return this.squares[x][y + 1].string;
				}
				break;
			case 'left':
				if (this.squares[x - 1]) {
					return  this.squares[x - 1][y].string;
				}
				break;
		}

		return false;
	};

	this.oppositeDirection = function(to) {
		switch (to) {
			case 'up': return 'down';
			case 'right': return 'left';
			case 'down': return 'up';
			case 'left': return 'right';
		}
	};

	this.nextRandomWalk = function(x, y, to) {
		var possibilities = [];
		var directions = _.shuffle([0, 1, 2, 3]);
		var i = 0;

		//Check possibilities
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

		//Random choice, not where the player comes from
		for (i = 0; i < possibilities.length; i++) {
			if (possibilities[i][2] !== this.oppositeDirection(to))
				return possibilities[i];
		}

		if (possibilities.length > 0)
			return possibilities[0];
		else
			return false;
	};

	this.walkRandom = function(to) {
		if (this.status === 'start') {
			var _this = this;
			var next = false;

			if (this.player[0] === this.end[0] && this.player[1] === this.end[1]) {
				this.finish();
				return;
			}

			//Walk
			if (!to) {
				next = this.firstWalk(this.player[0], this.player[1]);
			} else {
				next = this.nextRandomWalk(this.player[0], this.player[1], to);
			}

			if (next !== false) {
				this.player = [next[0], next[1]];

				if (this.chalk) {
					this.squares[next[0]][next[1]].chalked = true;
				}

				this.draw();
			} else {
				return;
			}

			setTimeout(function() {
				_this.walkRandom(next[2]);
			}, this.speed);
		} else {
			return;
		}
	};

	this.walkBacktracking = function() {
		if (this.status === 'start') {
			var _this = this;
			var next = false;
			var x = this.player[0];
			var y = this.player[1];
			var string = false;

			if (x === this.end[0] && y === this.end[1]) {
				this.finish();
				return;
			}

			//Reihenfolge: Rechts, oben, links, unten
			//Erste freie Felder, sonst dem Faden entlang zurück

			if (next === false && this.canWalkTo(x, y, 'right') !== false && this.chalked(x, y, 'right') === false)
				next = [x + 1, y];

			if (next === false && this.canWalkTo(x, y, 'up') !== false && this.chalked(x, y, 'up') === false)
				next = [x, y - 1];

			if (next === false && this.canWalkTo(x, y, 'left') !== false && this.chalked(x, y, 'left') === false)
				next = [x - 1, y];

			if (next === false && this.canWalkTo(x, y, 'down') !== false && this.chalked(x, y, 'down') === false)
				next = [x, y + 1];

			if (next !== false) {
				string = true;
			} else {
				//Zurück
				if (next === false && this.canWalkTo(x, y, 'right') !== false && this.stringed(x, y, 'right') === true)
					next = [x + 1, y];

				if (next === false && this.canWalkTo(x, y, 'up') !== false && this.stringed(x, y, 'up') === true)
					next = [x, y - 1];

				if (next === false && this.canWalkTo(x, y, 'left') !== false && this.stringed(x, y, 'left') === true)
					next = [x - 1, y];

				if (next === false && this.canWalkTo(x, y, 'down') !== false && this.stringed(x, y, 'down') === true)
					next = [x, y + 1];

				if (next === false) {
					//Start
					if (next === false && this.canWalkTo(x, y, 'right') !== false)
						next = [x + 1, y];

					if (next === false && this.canWalkTo(x, y, 'up') !== false)
						next = [x, y - 1];

					if (next === false && this.canWalkTo(x, y, 'left') !== false)
						next = [x - 1, y];

					if (next === false && this.canWalkTo(x, y, 'down') !== false)
						next = [x, y + 1];

					if (next !== false) {
						string = true;
					}
				}
			}

			if (next !== false) {
				if (string === true) {
					this.squares[next[0]][next[1]].string = true;
				} else {
					this.squares[x][y].string = false;
				}

				if (this.chalk) {
					this.squares[next[0]][next[1]].chalked = true;
				}

				this.player = [next[0], next[1]];
				this.draw();
			} else {
				return;
			}

			setTimeout(function() {
				_this.walkBacktracking();
			}, this.speed);
		} else {
			return;
		}
	};

	this.walk = function(direction) {
		var canWalk = false;

		var x = this.player[0];
		var y = this.player[1];

		var xNext = false;
		var yNext = false;

		if (x === this.end[0] && y === this.end[1]) {
			this.finish();
			return;
		}

		switch (direction) {
			case 'up':
				if (this.squares[x][y - 1] && this.squares[x][y].top === false) {
					xNext = x;
					yNext = y - 1;
					canWalk = true;
				}

				break;
			case 'right':
				if (this.squares[x + 1] && this.squares[x + 1][y] && this.squares[x][y].right === false) {
					xNext = x + 1;
					yNext = y;
					canWalk = true;
				}

				break;
			case 'down':
				if (this.squares[x][y + 1] && this.squares[x][y].bottom === false) {
					xNext = x;
					yNext = y + 1;
					canWalk = true;
				}

				break;
			case 'left':
				if (this.squares[x - 1] && this.squares[x - 1][y] && this.squares[x][y].left === false) {
					xNext = x - 1;
					yNext = y;
					canWalk = true;
				}

				break;
		}

		if (canWalk) {
			this.player[0] = xNext;
			this.player[1] = yNext;

			if (this.chalk) {
				this.squares[xNext][yNext].chalked = true;
			}

			if (this.string) {
				if (this.stringed(x, y, direction)) {
					this.squares[x][y].string = false;
				}

				this.squares[xNext][yNext].string = true;
			}

			this.draw();
		}

		return canWalk;
	};

	this.walkUp = function() {
		this.walk('up');
	};

	this.walkRight = function() {
		this.walk('right');
	};

	this.walkDown = function() {
		this.walk('down');
	};

	this.walkLeft = function() {
		this.walk('left');
	};

	this.start = function() {
		var _this = this;

		switch (this.type) {
			case 'random':
				this.status = 'start';
				this.walkRandom(null);
				break;
			case 'manual':
				MazeController.stopAll();

				this.status = 'start';

				$('body').keydown(function(e) {
					switch (e.keyCode) {
						case _this.keyUp:
							_this.walkUp();
							break;
						case _this.keyRight:
							_this.walkRight();
							break;
						case _this.keyDown:
							_this.walkDown();
							break;
						case _this.keyLeft:
							_this.walkLeft();
							break;
					}

					if (e.keyCode === _this.keyUp ||
						e.keyCode === _this.keyRight ||
						e.keyCode === _this.keyDown ||
						e.keyCode === _this.keyLeft) {

						e.preventDefault();
						return false;
					}
				});
				break;
			case 'backtracking':
				this.status = 'start';
				this.walkBacktracking();
				break;
		}

		$(this.selectorStart).addClass('disabled');

		if (this.selectorStop)
			$(this.selectorStop).removeClass('disabled');
	};

	this.finish = function() {
		this.status = 'finish';
		this.draw();
		MazeController.unbindKeys();
	};

	this.stop = function() {
		this.status = 'stop';

		MazeController.unbindKeys();

		if (this.selectorStart)
			$(this.selectorStart).removeClass('disabled');

		$(this.selectorStop).addClass('disabled');
	};

	this.reset = function() {
		this.init();
		this.status = 'reset';

		if (this.selectorStart)
			$(this.selectorStart).removeClass('disabled');

		if (this.selectorStop)
			$(this.selectorStop).addClass('disabled');
	};

	this.init = function() {
		var _this = this;
		var top = true;
		var right = true;
		var bottom = true;
		var left = true;

		//Init fields
		for (var x = 0; x < this.rowCount; x++) {
			this.squares[x] = [];
			for (var y = 0; y < this.rowCount; y++) {
				this.squares[x][y] = new MazeCell(true, true, true, true, x, y);
			}
		}

		this.setPlayer();
		this.createMaze();

		//Set controls
		if (this.selectorStart !== false) {
			$(this.selectorStart).on('click', function() {
				_this.start();
			});
		}

		if (this.selectorStop !== false) {
			$(this.selectorStop).on('click', function() {
				_this.stop();
			});
		}

		if (this.selectorReset !== false) {
			$(this.selectorReset).on('click', function() {
				_this.reset();
			});
		}

		this.draw();
	};
}

$(function() {
	var eRandom = $('#experiment-labyrinth-random').get(0);
	var eManual = $('#experiment-labyrinth-manual').get(0);
	var eSmall = $('#experiment-labyrinth-small').get(0);
	var eChalk = $('#experiment-labyrinth-chalk').get(0);
	var eString = $('#experiment-labyrinth-string').get(0);
	var eManualString = $('#experiment-labyrinth-manual-string').get(0);

	if (eRandom.getContext) {
		var eRandomMaze = MazeController.create(eRandom, 20, 'random');

		eRandomMaze.selectorStart = '#experiment-labyrinth-random-start';
		eRandomMaze.selectorStop = '#experiment-labyrinth-random-stop';
		eRandomMaze.selectorReset = '#experiment-labyrinth-random-reset';

		eRandomMaze.init();
	}

	if (eManual.getContext) {
		var eManualMaze = MazeController.create(eManual, 20, 'manual');
		eManualMaze.torch = true;

		eManualMaze.selectorStart = '#experiment-labyrinth-manual-start';
		eManualMaze.selectorStop = '#experiment-labyrinth-manual-stop';
		eManualMaze.selectorReset = '#experiment-labyrinth-manual-reset';

		eManualMaze.init();
	}

	if (eSmall.getContext) {
		var eSmallMaze = MazeController.create(eSmall, 15, 'manual');
		eSmallMaze.torch = true;

		eSmallMaze.selectorStart = '#experiment-labyrinth-small-start';
		eSmallMaze.selectorStop = '#experiment-labyrinth-small-stop';
		eSmallMaze.selectorReset = '#experiment-labyrinth-small-reset';

		eSmallMaze.init();
	}

	if (eChalk.getContext) {
		var eChalkMaze = MazeController.create(eChalk, 20, 'manual');
		eChalkMaze.torch = true;
		eChalkMaze.chalk = true;

		eChalkMaze.selectorStart = '#experiment-labyrinth-chalk-start';
		eChalkMaze.selectorStop = '#experiment-labyrinth-chalk-stop';
		eChalkMaze.selectorReset = '#experiment-labyrinth-chalk-reset';

		eChalkMaze.init();
	}

	if (eString.getContext) {
		var eStringMaze = MazeController.create(eString, 20, 'backtracking');
		eStringMaze.chalk = true;
		eStringMaze.string = true;

		eStringMaze.selectorStart = '#experiment-labyrinth-string-start';
		eStringMaze.selectorStop = '#experiment-labyrinth-string-stop';
		eStringMaze.selectorReset = '#experiment-labyrinth-string-reset';

		eStringMaze.init();
	}

	if (eManualString.getContext) {
		var eManualStringMaze = MazeController.create(eManualString, 20, 'manual');
		eManualStringMaze.torch = true;
		eManualStringMaze.chalk = true;
		eManualStringMaze.string = true;

		eManualStringMaze.selectorStart = '#experiment-labyrinth-manual-string-start';
		eManualStringMaze.selectorStop = '#experiment-labyrinth-manual-string-stop';
		eManualStringMaze.selectorReset = '#experiment-labyrinth-manual-string-reset';

		eManualStringMaze.init();
	}
});
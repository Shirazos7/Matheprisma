MazeCell = function(top, right, bottom, left, x, y) {
	this.top = top;
	this.right = right;
	this.bottom = bottom;
	this.left = left;

	this.x = x;
	this.y = y;

	this.frontier = false;
	this.visited = false;
};

Maze = function(element) {
	this.context = element.getContext('2d');

	this.status = 'reset';

	element.width = $(element).parent().width();
	element.height = $(element).width();

	this.colorBackground = 'rgb(255, 255, 255)';
	this.colorWall = 'rgb(255, 255, 255)';
	this.colorExit = 'rgb(175, 255, 175)';
	this.colorPlayer = 'rgb(255, 50, 50)';

	this.wallWidth = 0.5;

	this.rowCount = 30;
	this.squareSize = (element.width / this.rowCount);
	this.squares = [];

	this.player = [0, 0];
	this.end = [0, 0];

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

	this.drawField = function(x, y, color) {
		this.context.fillStyle = color;
		this.context.fillRect(x * this.squareSize, y * this.squareSize, this.squareSize, this.squareSize);
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
		this.context.fillStyle = this.colorBackground;
		this.context.fillRect(0, 0, element.width, element.height);

		this.context.fillStyle = this.colorWall;
		this.context.lineWidth = this.wallWidth;

		for (var x = 0; x < this.rowCount; x++) {
			for (var y = 0; y < this.rowCount; y++) {
				if (x === this.end[0] && y === this.end[1])
					this.drawField(x, y, this.colorExit);

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

		return possibilities[0];
	};

	this.walkRandom = function(to) {
		if (this.status === 'start') {
			var _this = this;
			var next = null;

			if (this.player[0] === this.end[0] && this.player[1] === this.end[1]) {
				this.status = 'stop';
				return;
			}

			//Walk
			if (!to) {
				next = this.firstWalk(this.player[0], this.player[1]);
			} else {
				next = this.nextRandomWalk(this.player[0], this.player[1], to);
			}

			if (next) {
				this.player = [next[0], next[1]];
			}

			this.draw();

			setTimeout(function() {
				_this.walkRandom(next[2]);
			}, 100);
		} else {
			return;
		}
	};

	this.startRandom = function() {
		this.status = 'start';

		this.walkRandom(null);
	};

	this.stop = function() {
		this.status = 'stop';
	};

	this.reset = function() {
		this.init();
		this.status = 'reset';
	};

	this.init = function() {
		var top = true;
		var right = true;
		var bottom = true;
		var left = true;

		//Init maze
		for (var x = 0; x < this.rowCount; x++) {
			this.squares[x] = [];
			for (var y = 0; y < this.rowCount; y++) {
				this.squares[x][y] = new MazeCell(true, true, true, true, x, y);
			}
		}

		this.setPlayer();
		this.createMaze();
		this.draw();
	};

	this.init();
};

$(function() {
	var eZufall = $('#experiment-labyrinth-zufall').get(0);

	if (eZufall.getContext) {
		console.log('Experiment: Zufall');
		var eZufallMaze = new Maze(eZufall);

		$('#experiment-labyrinth-zufall-start').on('click', function() {
			$('#experiment-labyrinth-zufall-start').addClass('disabled');

			console.log('Start: Zufall');
			eZufallMaze.startRandom(function(err) {
				//Finished
				if (!err) {
					$('#experiment-labyrinth-zufall-start').removeClass('disabled');
					$('#experiment-labyrinth-zufall-stop').addClass('disabled');
				}
			});

			$('#experiment-labyrinth-zufall-stop').removeClass('disabled');
		});

		$('#experiment-labyrinth-zufall-stop').on('click', function() {
			console.log('Stop: Zufall');
			eZufallMaze.stop();
			$('#experiment-labyrinth-zufall-start').removeClass('disabled');
			$('#experiment-labyrinth-zufall-stop').addClass('disabled');
		});

		$('#experiment-labyrinth-zufall-reset').on('click', function() {
			console.log('Reset: Zufall');
			eZufallMaze.reset();
			$('#experiment-labyrinth-zufall-start').removeClass('disabled');
			$('#experiment-labyrinth-zufall-stop').addClass('disabled');
		});
	}
});
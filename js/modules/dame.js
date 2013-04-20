var DameCell = Backbone.Model.extend({
	defaults: {
		color: 'black', //Hintegergrundfarbe
		queen: false, //Königin auf dem Feld
		avaiable: true //Wird nicht bedroht
	}
});

var Dame = Backbone.Model.extend({
	defaults: {
		element: null, //Schachbrett Element
		context: null, //Schachbrett Canvas context
		squareSize: null, //Größe eines Quadrats

		squares: [],
		queenCount: 0,

		/**
		 * Layout
		 */
		colorWhiteBackground: 'rgb(255, 255, 255)',
		colorWhiteText: 'rgb(0, 0, 0)',
		colorWhiteNotAvailable: 'rgb(230, 190, 190)',
		colorBlackBackground: 'rgb(0, 0, 0)',
		colorBlackText: 'rgb(255, 255, 255)',
		colorBlackNotAvailable: 'rgb(70, 20, 20)',

		fontSize: 20, //Wird automatisch berechnet

		/**
		 * Optionen
		 */
		n: 8 //Größe des Schachbretts und Anzahl der Damen
	},

	markFields: function(x, y, avaiable) {
		var squares = this.get('squares');
		var n = this.get('n');

		//Markiere Felder als bedroht
		for (var i = 0; i < n; i++) {
			//Horizontale
			squares[x][i].set({'avaiable': avaiable});

			//Vertikale
			squares[i][y].set({'avaiable': avaiable});

			//Diagonalen
			if (i > 0) {
				if (x - i > 0 && y - i > 0) {
					squares[x - i][y - i].set({'avaiable': avaiable});
				}
				if (x + i < n && y - i > 0) {
					squares[x + i][y - i].set({'avaiable': avaiable});
				}
				if (x - i > 0 && y + i < n) {
					squares[x - i][y + i].set({'avaiable': avaiable});
				}
				if (x + i < n && y + i < n) {
					squares[x + i][y + i].set({'avaiable': avaiable});
				}
			}
		}
	},

	click: function(x, y) {
		var squares = this.get('squares');
		var n = this.get('n');

		if (squares[x][y].get('avaiable') === true) {
			//Setze Königin
			squares[x][y].set({
				'avaiable': false,
				'queen': true
			});

			this.markFields(x, y, false);

			this.set({
				'queenCount': this.get('queenCount') + 1
			});
		} else if (squares[x][y].get('queen') === true) {
			squares[x][y].set({
				'avaiable': true,
				'queen': false
			});

			this.markFields(x, y, true);

			this.set({
				'queenCount': this.get('queenCount') - 1
			});
		}

		console.log(this.get('queenCount'));
		if (this.get('queenCount') >= n) {
			App.success($(this.get('element')).parent().find('.row'), 'Alle Königinen erfolgreich platziert!');
		}

		this.set({
			squares: squares
		});

		this.draw();
	},

	getColor: function(colorName) {
		switch (colorName) {
			case 'white': return this.get('colorWhiteBackground');
			case 'black': return this.get('colorBlackBackground');
		}
	},

	getTextColor: function(colorName) {
		switch (colorName) {
			case 'white': return this.get('colorWhiteText');
			case 'black': return this.get('colorBlackText');
		}
	},

	getNotAvailableColor: function(colorName) {
		switch (colorName) {
			case 'white': return this.get('colorWhiteNotAvailable');
			case 'black': return this.get('colorBlackNotAvailable');
		}
	},

	drawField: function(x, y, square) {
		var context = this.get('context');
		var squareSize = this.get('squareSize');

		if (square.get('avaiable') === true) {
			context.fillStyle = this.getColor(square.get('color'));
		} else {
			context.fillStyle = this.getNotAvailableColor(square.get('color'));
		}

		context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);

		if (square.get('queen') === true) {
			context.font = this.get('fontSize') + 'px Arial';
			context.fillStyle = this.getTextColor(square.get('color'));
			context.fillText('♛', x * squareSize + (0.12 * squareSize), y * squareSize + (0.75 * squareSize));
		}
	},

	draw: function() {
		var squares = this.get('squares');
		var n = this.get('n');

		for (var x = 0; x < n; x++) {
			for (var y = 0; y < n; y++) {
				this.drawField(x, y, squares[x][y]);
			}
		}
	},

	init: function() {
		var n = this.get('n');
		var squares = this.get('squares');
		var element = this.get('element');
		var color;

		squares = [];
		for (var x = 0; x < n; x++) {
			squares[x] = [];
			for (var y = 0; y < n; y++) {
				color = ((x + y) % 2 === 0) ? 'white' : 'black';
				squares[x][y] = new DameCell({
					color: color
				});
			}
		}

		element.width = $(element).parent().width();
		element.height = $(element).width();

		this.set({
			context: element.getContext('2d'),
			squareSize: (element.width / n),
			fontSize: Math.floor(element.width / n * 0.75),
			squares: squares
		});

		this.draw();
	},

	initialize: function() {
		var _this = this;
		var element = this.get('element');

		this.init();

		$(element).on('click', function(e) {
			var x = Math.floor((e.pageX - $(this).offset().left) / _this.get('squareSize'));
			var y = Math.floor((e.pageY - $(this).offset().top) / _this.get('squareSize'));

			_this.click(x, y);
		});
	}
});

var DameController = Backbone.Collection.extend({
	model: Dame
});

var damen = new DameController();

$(function() {
	damen.add([
		{
			id: 'full',
			element: $('#experiment-dame-full').get(0),
			n: 8
		}
	]);

	$('#experiment-dame-full-change').on('click', function(e) {
		var brett = damen.get('full');
		var n = parseInt($('#experiment-dame-full-n').val(), 10);

		if (_.isNumber(n) === false) {
			n = 8;
			$('#experiment-dame-full-n').val(n);
		}

		brett.set({
			n: n
		});
		brett.init();

		e.preventDefault();
		return false;
	});
});
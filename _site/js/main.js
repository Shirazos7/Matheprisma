function getRandomBoolean() {
	return (Math.random() >= 0.5);
}

function setAffixWidth() {
	$('#nav-submodules ul').width($('#nav-submodules').width());
}

var App = {
	baseUrl: null,

	alert: function(element, message, type, prepend) {
		var $alert = $('<div class="alert alert-' + type + '">' +
				'<button type="button" class="close" data-dismiss="alert">&times;</button>' + message +
			'</div>');

		if (prepend === false)
			$(element).append($alert);
		else
			$(element).prepend($alert);

		$alert.delay(2000).fadeOut(1000);
	},

	success: function(element, message, prepend) {
		if (!prepend) prepend = false;
		this.alert(element, message, 'success', prepend);
	},

	info: function(element, message, prepend) {
		if (!prepend) prepend = false;
		this.alert(element, message, 'info', prepend);
	},

	error: function(element, message, prepend) {
		if (!prepend) prepend = false;
		this.alert(element, message, 'error', prepend);
	},

	sleep: function(milliseconds) {
		var startTime = new Date().getTime();
		while (new Date().getTime() < startTime + milliseconds) {
			//Sleep
		}

		return true;
	}
};

function StackDisplay(element) {
	this.element = element;
	this.context = element.getContext('2d');

	element.width = $(element).parent().width();
	this.width = element.width;
	this.height = element.height;

	/**
	 * Optionen
	 */
	this.colorBackground = 'rgb(255, 255, 255)';
	this.colorItemDefault = 'rgb(150, 255, 150)';
	this.colorItemTextDefault = 'black';
	this.itemWidth = 100;
	this.fontSize = 14;

	this.stack = [];
	this.currentLevel = 0;
	this.itemsInRow = Math.round(this.width / (this.itemWidth + 10));

	this.directionToChar = function(direction) {
		switch (direction) {
			case 'up': return 'O';
			case 'right': return 'R';
			case 'down': return 'U';
			case 'left': return 'L';
		}
	};

	this.draw = function() {
		var index = 0;
		var indexStart;
		var j;
		indexStart = (this.stack.length <= this.itemsInRow) ? 0 : this.stack.length - this.itemsInRow;

		this.context.fillStyle = this.colorBackground;
		this.context.fillRect(0, 0, this.width, this.height);

		for (var i = indexStart; i < this.stack.length; i++) {
			var item = this.stack[i];
			var x = index * (this.itemWidth + 10);
			var y = 0;
			var efText = 'EF: ';
			var mText = 'M: ';

			this.context.fillStyle = item.colorBackground || this.colorItemDefault;
			this.context.fillRect(x, y, this.itemWidth, this.height);
			this.context.font = this.fontSize + 'px Arial';
			this.context.fillStyle = item.colorText || this.colorItemTextDefault;

			x += 4;

			y += 4 + this.fontSize;
			for (j = 0; j < i; j++) {
				efText += this.directionToChar(this.stack[j].x) + ' ';
			}
			this.context.fillText(efText, x, y);

			y += 4 + this.fontSize;
			for (j = 0; j < item.m.length; j++) {
				mText += this.directionToChar(item.m[j]) + ' ';
			}
			this.context.fillText(mText, x, y);

			y += 4 + this.fontSize;
			this.context.fillText('X: ' + this.directionToChar(item.x), x, y);

			index++;
		}
	};

	this.push = function(item) {
		this.currentLevel++;
		item.level = this.currentLevel;
		this.stack.push(item);

		this.draw();
	};

	this.pop = function() {
		this.currentLevel--;
		var item = this.stack.pop();

		this.draw();
		return item;
	};

	this.removeDirection = function(direction) {
		console.log('Remove direction', direction);
		var item = this.stack.pop();

		//Lösche bereits durchlaufende Richtungen
		item.m = _.reject(item.m, function(itemDirection) {
			return (itemDirection == direction);
		});

		this.stack.push(item);

		this.draw();
	};
}

$(function() {
	$('.help').popover({
		placement: 'top',
		trigger: 'hover'
	});

	if ($('#nav-submodules').length > 0) {
		//Überschriften zur Navigation hinzufügen
		var sections = $('.module h3');

		for (var i = 0; i < sections.length; i++) {
			var section = sections[i];

			$('#nav-submodules ul').append('<li><a href="#' + $(section).attr('id') + '">' + $(section).html() + '</li>');
		}

		if ($(window).width() > 768) {
			$('#nav-submodules ul').affix({
				offset: $('#nav-submodules ul').position()
			});

			$('#nav-submodules').scrollspy('refresh');

			$(window).resize(function() {
				if ($(window).width() > 768) {
					setAffixWidth();
				} else {
					//ToDo: affix deaktivieren statt die Größe anzupassen
					setAffixWidth();
				}
			});
		}

		setAffixWidth();
	}

	$('.answer-item').draggable({
		cursor: 'pointer'
	});

	//ToDo: Generalisieren
	$('.question-item').droppable({
		accept: '.answer-item',
		drop: function(event, ui) {
			//Antwort zu Frage hinzufügen
			$(ui.draggable).detach().css({top: 0,left: 0}).appendTo(this);

			var questionCount = $('#question-drop-labyrinth > li').length;
			var correntAnswerCount = 0;

			for (var i = 0; i < questionCount; i++) {
				var question = $('#question-drop-labyrinth > li').get(i);
				var answer = $(question).find('.answer-item');

				if (answer.length !== 1) {
					return;
				}

				if ($(question).attr('data-question') == $(answer).attr('data-answer')) {
					correntAnswerCount++;
				}
			}

			if (correntAnswerCount === questionCount) {
				App.success($('#answer-drag-labyrinth').parent().parent(), 'Alle Fragen richtig beantwortet.', true);
			} else {
				App.error($('#answer-drag-labyrinth').parent().parent(), 'Du hast mindestens eine Frage falsch beantwortet!', true);
			}
		}
	});

	$('[data-task="question"]').each(function(index) {
		console.log('Initialisiere Aufgabe: Frage', index);

		var _this = this;
		var questionCheck = $(this).find('#' + $(this).attr('data-check'));
		var questionResult = $(this).attr('data-result');
		var questionValue = $(this).find('#' + $(this).attr('data-value'));
		var questionFeedback = $(this).find('.control-result');

		questionCheck.on('click', function() {
			console.log('Prüfe Aufgabe: Frage Gruppe', index);

			questionFeedback.removeClass('has-error');
			questionFeedback.removeClass('has-success');

			if (questionValue.val() != questionResult) {
				questionFeedback.addClass('has-error');
				questionFeedback.find('label').html('Das Ergebnis war leider nicht richtig!');
			} else {
				questionFeedback.addClass('has-success');
				questionFeedback.find('label').html('Das Ergebnis ist richtig, Glückwunsch');
			}
		});
	});

	$('[data-task="question-group"]').each(function(index) {
		console.log('Initialisiere Aufgabe: Frage Gruppe', index);

		var _this = this;
		var questionCheck = $(this).find('#' + $(this).attr('data-check'));

		questionCheck.on('click', function() {
			console.log('Prüfe Aufgabe: Frage Gruppe', index);

			$(_this).find('.answer-correct').remove();
			$(_this).find('.answer-failed').remove();

			$(_this).find('.question-input').each(function(questionIndex) {
				if ($(this).val() == $(this).attr('data-answer')) {
					$(this).after('<span class="answer-correct glyphicon glyphicon-ok">');
				} else {
					$(this).after('<span class="answer-failed glyphicon glyphicon-remove">');
				}
			});
		});
	});
});
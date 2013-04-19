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
	}
};

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
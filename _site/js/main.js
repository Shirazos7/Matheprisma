function getRandomBoolean() {
	return (Math.random() >= 0.5);
}

function setAffixWidth() {
	$('.nav-module').width($('.nav-module').parent().width());
}

var App = {
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

	if ($('.nav-module').length) {
		//Add h3 headings to sidebar
		var sections = $('.module h3');
		
		for (var i = 0; i < sections.length; i++) {
			var section = sections[i];

			$('.nav-module').append('<li><a href="#' + $(section).attr('id') + '">' + $(section).html() + '</li>');
		}

		if ($(window).width() > 768) {
			$('.nav-module').affix({
				offset: $('.nav-module').position()
			});

			$('.nav-module').scrollspy();

			$(window).resize(function() {
				setAffixWidth();
			});
		} else {
			console.log($(window).width());
		}

		setAffixWidth();
	}

	$('.answer-labyrinth-item').draggable({
		cursor: 'pointer'
	});

	$('.question-labyrinth-item').droppable({
		accept: '.answer-labyrinth-item',
		drop: function(event, ui) {
			//Antwort zu Frage hinzufügen
			$(ui.draggable).detach().css({top: 0,left: 0}).appendTo(this);

			var questionCount = $('#question-drop-labyrinth > li').length;
			var correntAnswerCount = 0;

			for (var i = 0; i < questionCount; i++) {
				var question = $('#question-drop-labyrinth > li').get(i);
				var answer = $(question).find('.answer-labyrinth-item');

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
});
function getRandomBoolean() {
	return (Math.random() >= 0.5);
}

function setAffixWidth() {
	$('.nav-module').width($('.nav-module').parent().width());
}

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

		$('.nav-module').affix({
			offset: $('.nav-module').position()
		});

		$('.nav-module').scrollspy();

		$(window).resize(function() {
			setAffixWidth();
		});

		setAffixWidth();
	}
});
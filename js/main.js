function getRandomBoolean() {
	return (Math.random() >= 0.5);
}

$(function() {
	$('.help').popover({
		placement: 'top',
		trigger: 'hover'
	});
});
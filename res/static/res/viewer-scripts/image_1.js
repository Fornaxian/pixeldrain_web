// Image zoom-in script

var zoomed = false;
// When a user clicks the image
$("#displayImg").on("contextmenu", function (event) {
	// Trigger on a right click
	if (event.which === 3) {
		if (zoomed) {
			$(".pannable").css("max-width", "100%");
			$(".pannable").css("max-height", "100%");
			$(".pannable").css("top", "50%");
			$(".pannable").css("left", "auto");
			$(".pannable").css("transform", "translateY(-50%)");
			zoomed = false;
		} else {
			$(".pannable").css("max-width", "none");
			$(".pannable").css("max-height", "none");
			$(".pannable").css("transform", "none");
			$(".pannable").css("top", "0");
			zoomed = true;
		}

		return false;
	}
});

// Image dragging around the screen
// Grabbed this script from stackoverflow, thanks Alexander Mistakidis!
// http://stackoverflow.com/questions/22187130/panning-div-element-around-using-javascript
// Edited to fit my needs
var deltaX = 0;
var deltaY = 0;
var scale = 1.0;

var drag = {
	elem: null,
	x: 0,
	y: 0,
	state: false
};
var delta = {
	x: 0,
	y: 0
};

$(".pannable").on("mousedown", function (e) {
	if (!drag.state && e.which === 1) {
		drag.elem = $('.pannable');
		drag.x = e.pageX;
		drag.y = e.pageY;
		drag.state = true;

		return false;
	}
});


$(document).on("mousemove", function (e) {
	if (drag.state) {
		delta.x = e.pageX - drag.x;
		delta.y = e.pageY - drag.y;

		var cur_offset = $(drag.elem).offset();

		$(drag.elem).offset({
			left: (cur_offset.left + delta.x),
			top: (cur_offset.top + delta.y)
		});

		drag.x = e.pageX;
		drag.y = e.pageY;
	}
});

$(document).on("mouseup", function () {
	if (drag.state) {
		drag.state = false;
	}
});
// Image zoom-in script

var zoomed = false;
// When a user clicks the image
$("#displayImg").on("dblclick doubletap", function (event) {
	if (zoomed) {
		$("#displayImg").css("max-width", "100%");
		$("#displayImg").css("max-height", "100%");
		$("#displayImg").css("top", "50%");
		$("#displayImg").css("left", "auto");
		$("#displayImg").css("transform", "translateY(-50%)");
		$(".image-container").css("overflow", "hidden");
		zoomed = false;
	} else {
		$("#displayImg").css("max-width", "none");
		$("#displayImg").css("max-height", "none");
		$("#displayImg").css("transform", "none");
		$(".pannable").css("top", "0");
		$(".image-container").css("overflow", "scroll");
		zoomed = true;
	}
	
	
	return false;
});

// Image dragging around the screen

var drag = {
	x: 0,
	y: 0,
	state: false
};

$(".pannable").on("mousedown", function (e) {
	if (!drag.state && e.which === 1 && zoomed) {
		drag.x = e.pageX;
		drag.y = e.pageY;
		drag.state = true;

		return false;
	}
});

var img = $(".image-container");

$(document).on("mousemove", function (e) {
	if (drag.state) {
		img.scrollLeft(img.scrollLeft() - (e.pageX - drag.x));
		img.scrollTop(img.scrollTop() - (e.pageY - drag.y));

		drag.x = e.pageX;
		drag.y = e.pageY;
	}
});

$(document).on("mouseup", function () {
	if (drag.state) {
		drag.state = false;
	}
});
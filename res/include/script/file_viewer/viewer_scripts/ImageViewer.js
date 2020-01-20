class ImageViewer {
	viewer = null;
	file   = null;

	imgContainer = null;
	imgElement   = null;

	zoomed = false;
	x = 0;
	y = 0;
	dragging = false;

	constructor(viewer, file) {let iv = this;
		iv.viewer = viewer;
		iv.file   = file;

		iv.imgContainer = document.createElement("div");
		iv.imgContainer.classList = "image-container";

		iv.imgElement = document.createElement("img");
		iv.imgElement.classList = "pannable drop-shadow";
		iv.imgElement.src = apiEndpoint+"/file/"+iv.file.id;
		iv.imgElement.addEventListener("mousedown", (e) => { return iv.mousedown(e); });
		iv.imgElement.addEventListener("dblclick",  (e) => { return iv.doubleclick(e); });
		iv.imgElement.addEventListener("doubletap", (e) => { return iv.doubleclick(e); });
		document.addEventListener("mousemove", (e) => { return iv.mousemove(e); });
		document.addEventListener("mouseup",   (e) => { return iv.mouseup(e); });

		iv.imgContainer.appendChild(iv.imgElement);
	}

	render(parent) {let iv = this;
		parent.appendChild(iv.imgContainer);
	}

	doubleclick(e) {let iv = this;
		if (iv.zoomed) {
			iv.imgElement.style.maxWidth = "100%";
			iv.imgElement.style.maxHeight = "100%";
			iv.imgElement.style.top = "50%";
			iv.imgElement.style.left = "auto";
			iv.imgElement.style.transform = "translateY(-50%)";
			iv.imgContainer.style.overflow = "hidden";
			iv.zoomed = false;
		} else {
			iv.imgElement.style.maxWidth = "none";
			iv.imgElement.style.maxHeight = "none";
			iv.imgElement.style.top = "0";
			iv.imgElement.style.left = "";
			iv.imgElement.style.transform = "none";
			iv.imgContainer.style.overflow = "scroll";
			iv.zoomed = true;
		}

		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	mousedown(e) {let iv = this;
		if (!iv.dragging && e.which === 1 && iv.zoomed) {
			iv.x = e.pageX;
			iv.y = e.pageY;
			iv.dragging = true;

			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}

	mousemove(e) {let iv = this;
		if (iv.dragging) {
			iv.imgContainer.scrollLeft = iv.imgContainer.scrollLeft - (e.pageX - iv.x);
			iv.imgContainer.scrollTop  = iv.imgContainer.scrollTop  - (e.pageY - iv.y);

			iv.x = e.pageX;
			iv.y = e.pageY;

			e.preventDefault();
			e.stopPropagation();
			return false;
		}

	}

	mouseup(e) {let iv = this;
		if (iv.dragging) {
			iv.dragging = false;

			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}
}

// var zoomed = false;
// // When a user clicks the image
// $("#displayImg").on("dblclick doubletap", function (event) {
// 	if (zoomed) {
// 		$("#displayImg").css("max-width", "100%");
// 		$("#displayImg").css("max-height", "100%");
// 		$("#displayImg").css("top", "50%");
// 		$("#displayImg").css("left", "auto");
// 		$("#displayImg").css("transform", "translateY(-50%)");
// 		$(".image-container").css("overflow", "hidden");
// 		zoomed = false;
// 	} else {
// 		$("#displayImg").css("max-width", "none");
// 		$("#displayImg").css("max-height", "none");
// 		$("#displayImg").css("transform", "none");
// 		$(".pannable").css("top", "0");
// 		$(".image-container").css("overflow", "scroll");
// 		zoomed = true;
// 	}


// 	return false;
// });

// Image dragging around the screen

// var drag = {
// 	x: 0,
// 	y: 0,
// 	state: false
// };

// $(".pannable").on("mousedown", function (e) {
// 	if (!drag.state && e.which === 1 && zoomed) {
// 		drag.x = e.pageX;
// 		drag.y = e.pageY;
// 		drag.state = true;

// 		return false;
// 	}
// });

// var img = $(".image-container");

// $(document).on("mousemove", function (e) {
// 	if (drag.state) {
// 		img.scrollLeft(img.scrollLeft() - (e.pageX - drag.x));
// 		img.scrollTop(img.scrollTop() - (e.pageY - drag.y));

// 		drag.x = e.pageX;
// 		drag.y = e.pageY;
// 	}
// });

// $(document).on("mouseup", function () {
// 	if (drag.state) {
// 		drag.state = false;
// 	}
// });

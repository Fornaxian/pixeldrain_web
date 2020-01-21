class ImageViewer {
	viewer = null;
	file   = null;

	container = null;
	element   = null;

	zoomed = false;
	x = 0;
	y = 0;
	dragging = false;

	constructor(viewer, file) {let v = this;
		v.viewer = viewer;
		v.file   = file;

		v.container = document.createElement("dv");
		v.container.classList = "image-container";
		// v.container.style.lineHeight = "0";

		v.element = document.createElement("img");
		v.element.classList = "pannable center drop-shadow";
		v.element.src = apiEndpoint+"/file/"+v.file.id;
		v.element.addEventListener("dblclick",  (e) => { return v.doubleclick(e); });
		v.element.addEventListener("doubletap", (e) => { return v.doubleclick(e); });
		v.element.addEventListener("mousedown", (e) => { return v.mousedown(e); });
		document.addEventListener("mousemove",  (e) => { return v.mousemove(e); });
		document.addEventListener("mouseup",    (e) => { return v.mouseup(e); });

		v.container.appendChild(v.element);
	}

	render(parent) {let v = this;
		parent.appendChild(v.container);
	}

	doubleclick(e) {let v = this;
		if (v.zoomed) {
			v.element.style.maxWidth = "100%";
			v.element.style.maxHeight = "100%";
			v.element.style.top = "50%";
			v.element.style.left = "auto";
			v.element.style.transform = "translateY(-50%)";
			v.container.style.overflow = "hidden";
			v.zoomed = false;
		} else {
			v.element.style.maxWidth = "none";
			v.element.style.maxHeight = "none";
			v.element.style.top = "0";
			v.element.style.left = "";
			v.element.style.transform = "none";
			v.container.style.overflow = "scroll";
			v.zoomed = true;
		}

		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	mousedown(e) {let v = this;
		if (!v.dragging && e.which === 1 && v.zoomed) {
			v.x = e.pageX;
			v.y = e.pageY;
			v.dragging = true;

			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}

	mousemove(e) {let v = this;
		if (v.dragging) {
			v.container.scrollLeft = v.container.scrollLeft - (e.pageX - v.x);
			v.container.scrollTop  = v.container.scrollTop  - (e.pageY - v.y);

			v.x = e.pageX;
			v.y = e.pageY;

			e.preventDefault();
			e.stopPropagation();
			return false;
		}

	}

	mouseup(e) {let v = this;
		if (v.dragging) {
			v.dragging = false;

			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}
}

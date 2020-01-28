function ImageViewer(viewer, file) {
	this.viewer   = viewer;
	this.file     = file;
	this.zoomed   = false;
	this.x        = 0;
	this.y        = 0;
	this.dragging = false;

	this.container = document.createElement("dv");
	this.container.classList = "image-container";
	// this.container.style.lineHeight = "0";

	this.element = document.createElement("img");
	this.element.classList = "pannable center drop-shadow";
	this.element.src = apiEndpoint+"/file/"+this.file.id;
	this.element.addEventListener("dblclick",  (e) => { return this.doubleclick(e); });
	this.element.addEventListener("doubletap", (e) => { return this.doubleclick(e); });
	this.element.addEventListener("mousedown", (e) => { return this.mousedown(e); });
	document.addEventListener("mousemove",     (e) => { return this.mousemove(e); });
	document.addEventListener("mouseup",       (e) => { return this.mouseup(e); });

	this.container.appendChild(this.element);
}

ImageViewer.prototype.render = function(parent) {
	parent.appendChild(this.container);
}

ImageViewer.prototype.doubleclick = function(e) {
	if (this.zoomed) {
		this.element.style.maxWidth = "100%";
		this.element.style.maxHeight = "100%";
		this.element.style.top = "50%";
		this.element.style.left = "auto";
		this.element.style.transform = "translateY(-50%)";
		this.container.style.overflow = "hidden";
		this.zoomed = false;
	} else {
		this.element.style.maxWidth = "none";
		this.element.style.maxHeight = "none";
		this.element.style.top = "0";
		this.element.style.left = "";
		this.element.style.transform = "none";
		this.container.style.overflow = "scroll";
		this.zoomed = true;
	}

	e.preventDefault();
	e.stopPropagation();
	return false;
}

ImageViewer.prototype.mousedown = function(e) {
	if (!this.dragging && e.which === 1 && this.zoomed) {
		this.x = e.pageX;
		this.y = e.pageY;
		this.dragging = true;

		e.preventDefault();
		e.stopPropagation();
		return false;
	}
}

ImageViewer.prototype.mousemove = function(e) {
	if (this.dragging) {
		this.container.scrollLeft = this.container.scrollLeft - (e.pageX - this.x);
		this.container.scrollTop  = this.container.scrollTop  - (e.pageY - this.y);

		this.x = e.pageX;
		this.y = e.pageY;

		e.preventDefault();
		e.stopPropagation();
		return false;
	}

}

ImageViewer.prototype.mouseup = function(e) {
	if (this.dragging) {
		this.dragging = false;

		e.preventDefault();
		e.stopPropagation();
		return false;
	}
}

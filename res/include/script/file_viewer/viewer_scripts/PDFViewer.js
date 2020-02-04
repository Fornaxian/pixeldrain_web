function PDFViewer(viewer, file) {
	this.viewer = viewer
	this.file   = file

	this.container = document.createElement("iframe")
	this.container.classList = "image-container"
	this.container.style.border = "none"
	this.container.src = "/res/misc/pdf-viewer/web/viewer.html?file="+encodeURIComponent(this.file.get_href)
}
PDFViewer.prototype.render = function(parent) {
	parent.appendChild(this.container)
}

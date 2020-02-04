function VideoViewer(viewer, file, next) {
	this.viewer = viewer
	this.file   = file
	this.next   = next

	this.vidContainer = document.createElement("div")
	this.vidContainer.classList = "image-container"

	this.vidElement = document.createElement("video")
	this.vidElement.autoplay = "autoplay"
	this.vidElement.controls = "controls"
	this.vidElement.classList = "center drop-shadow"
	this.vidElement.addEventListener("ended", () => { this.next() }, false)

	this.videoSource = document.createElement("source")
	this.videoSource.src = this.file.get_href

	this.vidElement.appendChild(this.videoSource)
	this.vidContainer.appendChild(this.vidElement)
}

VideoViewer.prototype.render = function(parent) {
	parent.appendChild(this.vidContainer)
}

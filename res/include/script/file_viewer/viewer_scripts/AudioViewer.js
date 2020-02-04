function AudioViewer(viewer, file, next) {
	this.viewer = viewer
	this.file   = file
	this.next   = next

	this.container = document.createElement("div")
	this.container.classList = "image-container"
	this.container.appendChild(document.createElement("br"))

	this.icon = document.createElement("img")
	this.icon.src = "/res/img/mime/audio.png"
	this.container.appendChild(this.icon)

	this.container.appendChild(document.createElement("br"))
	this.container.appendChild(document.createTextNode(this.file.name))
	this.container.appendChild(document.createElement("br"))
	this.container.appendChild(document.createElement("br"))

	this.element = document.createElement("audio")
	this.element.autoplay = "autoplay"
	this.element.controls = "controls"
	this.element.style.width = "90%"
	this.element.addEventListener("ended", () => { this.next() }, false)

	this.source = document.createElement("source")
	this.source.src = this.file.get_href
	this.element.appendChild(this.source)
	this.container.appendChild(this.element)
}

AudioViewer.prototype.render = function(parent) {
	parent.appendChild(this.container)
}

function FileViewer(viewer, file, next) {
	this.viewer = viewer
	this.file   = file
	this.next   = next

	this.container = document.createElement("div")
	this.container.classList = "image-container"
	this.container.appendChild(document.createElement("br"))

	this.icon = document.createElement("img")
	this.icon.src = this.file.icon_href
	this.container.appendChild(this.icon)

	this.container.appendChild(document.createElement("br"))
	this.container.appendChild(document.createTextNode(file.name))
	this.container.appendChild(document.createElement("br"))
	this.container.appendChild(document.createTextNode("Type: "+file.mime_type))
	this.container.appendChild(document.createElement("br"))
	this.container.appendChild(document.createElement("br"))
	this.container.appendChild(document.createTextNode(
		"Press the 'Download' button in the menu to download this file"
	))
}

FileViewer.prototype.render = function(parent) {
	parent.appendChild(this.container)
}

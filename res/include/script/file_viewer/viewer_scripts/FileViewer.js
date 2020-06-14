function FileViewer(viewer, file, next) {
	this.viewer = viewer
	this.file   = file
	this.next   = next

	this.container = document.createElement("div")
	this.container.classList = "image-container"
	this.container.appendChild(document.createElement("br"))

	this.title = document.createElement("h1")
	this.title.innerText = "You are viewing a file on pixeldrain"
	this.container.appendChild(this.title)

	this.icon = document.createElement("img")
	this.icon.style.display = "inline-block"
	this.icon.style.verticalAlign = "middle"
	this.icon.src = this.file.icon_href
	this.container.appendChild(this.icon)

	this.fileDetails = document.createElement("div")
	this.fileDetails.style.display = "inline-block"
	this.fileDetails.style.textAlign = "left"
	this.fileDetails.style.paddingLeft = "8px"
	this.fileDetails.style.verticalAlign = "middle"

	this.fileDetails.appendChild(document.createTextNode("Name: "+file.name))
	this.fileDetails.appendChild(document.createElement("br"))
	this.fileDetails.appendChild(document.createTextNode("Type: "+file.mime_type))
	this.fileDetails.appendChild(document.createElement("br"))
	this.fileDetails.appendChild(document.createTextNode(
		"No preview is available for this file type. Download to view it locally"
	))
	this.fileDetails.appendChild(document.createElement("br"))

	this.btnDL = document.getElementById("btn_download").cloneNode(true)
	this.btnDL.addEventListener("click", () => { viewer.toolbar.download() })
	this.btnDL.classList = "button_highlight"
	this.fileDetails.appendChild(this.btnDL)

	this.container.appendChild(this.fileDetails)
}

FileViewer.prototype.render = function(parent) {
	parent.appendChild(this.container)
}

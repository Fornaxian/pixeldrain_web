function AbuseViewer(viewer, file, next) {
	this.viewer = viewer
	this.file = file
	this.next = next

	this.container = document.createElement("div")
	this.container.classList = "image-container"
	this.container.appendChild(document.createElement("br"))

	this.title = document.createElement("h1")
	this.title.innerText = "Unavailable For Legal Reasons"
	this.container.appendChild(this.title)

	this.description = document.createElement("p")
	this.description.innerText = "This file has received an abuse report and " +
		"was taken down."
	this.container.appendChild(this.description)

	this.description2 = document.createElement("p")
	this.description2.innerText = "Type of abuse: " + file.abuse_type + ". " +
		"Reporter: " + file.abuse_reporter_name + "."
	this.container.appendChild(this.description2)
}

AbuseViewer.prototype.render = function (parent) {
	parent.appendChild(this.container)

	// Disable the download button
	this.btnDownloadDisplay = this.viewer.toolbar.btnDownload.style.display
	this.viewer.toolbar.btnDownload.style.display = "none"
}

AbuseViewer.prototype.destroy = function (parent) {
	// Restore the download button
	this.viewer.toolbar.btnDownload.style.display = this.btnDownloadDisplay
}

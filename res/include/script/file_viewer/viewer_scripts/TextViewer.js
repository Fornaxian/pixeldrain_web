function TextViewer(viewer, file) {
	this.viewer = viewer
	this.file = file
	this.pre = null
	this.prettyprint = null

	this.container = document.createElement("div")
	this.container.classList = "text-container"

	if (this.file.name.endsWith(".md") || this.file.name.endsWith(".markdown") || file.mime_type === "text/demo") {
		this.getMarkdown()
	} else if (this.file.name.endsWith(".txt")) {
		this.getText()
	} else {
		this.getCode()
	}
}

TextViewer.prototype.getCode = function () {
	this.pre = document.createElement("pre")
	this.pre.classList = "pre-container prettyprint linenums"
	this.pre.innerText = "Loading..."
	this.container.appendChild(this.pre)

	if (this.file.size > 1 << 20) { // File larger than 1 MiB
		this.pre.innerText = "File is too large to view online.\nPlease download and view it locally."
		return
	}

	fetch(this.file.get_href).then(resp => {
		if (!resp.ok) { return Promise.reject(resp.status) }
		return resp.text()
	}).then(resp => {
		this.pre.innerText = resp

		// Load prettyprint script
		this.prettyprint = document.createElement("script")
		this.prettyprint.src = `{{noescape "https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?skin=desert"}}`
		this.container.appendChild(this.prettyprint)
	}).catch(err => {
		this.pre.innerText = "Error loading file: " + err
	})
}

TextViewer.prototype.getText = function () {
	this.pre = document.createElement("pre")
	this.pre.innerText = "Loading..."
	this.container.appendChild(this.pre)

	if (this.file.size > 1 << 20) { // File larger than 1 MiB
		this.pre.innerText = "File is too large to view online.\nPlease download and view it locally."
		return
	}

	fetch(this.file.get_href).then(resp => {
		if (!resp.ok) { return Promise.reject(resp.status) }
		return resp.text()
	}).then(resp => {
		this.pre.innerText = resp
	}).catch(err => {
		this.pre.innerText = "Error loading file: " + err
	})
}

TextViewer.prototype.getMarkdown = function () {
	fetch(
		domainURL() + window.location.pathname + "/preview"
	).then(resp => {
		if (!resp.ok) { return Promise.reject(resp.status) }
		return resp.text()
	}).then(resp => {
		this.container.innerHTML = resp
	}).catch(err => {
		this.container.innerText = "Error loading file: " + err
	})
}

TextViewer.prototype.render = function (parent) {
	parent.appendChild(this.container)
}

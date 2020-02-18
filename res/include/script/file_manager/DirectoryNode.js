
function DirectoryNode(file, index) {
	this.el = document.createElement("div")
	this.el.classList = "node"
	if (file.selected) {
		this.el.classList += " node_selected"
	}
	this.el.href = file.href
	this.el.target = "_blank"
	this.el.title = file.name
	this.el.setAttribute("fileindex", index)

	this.el.addEventListener("click", e => {
		if (e.detail > 1) {
			return // Prevent dblclick from triggering click
		}
		if (e.which == 2) {
			// Middle mouse button opens the file in a new window
			this.open(true)
			return
		}
		this.select()
	})
	this.el.addEventListener("tap")
	this.el.addEventListener("dblclick", e => {
		this.open(false)
	})

	{
		let cell = document.createElement("div")
		let thumb = document.createElement("img")
		thumb.src = file.icon
		cell.appendChild(thumb)
		let label = document.createElement("span")
		label.innerText = file.name
		cell.appendChild(label)
		cell.appendChild(label)
		this.el.appendChild(cell)
	}
	{
		let cell = document.createElement("div")
		cell.style.width = this.fieldDateWidth
		let label = document.createElement("span")
		label.innerText = printDate(new Date(file.dateCreated), true, true, false)
		cell.appendChild(label)
		this.el.appendChild(cell)
	}
	{
		let cell = document.createElement("div")
		cell.style.width = this.fieldSizeWidth
		let label = document.createElement("span")
		label.innerText = file.sizeLabel
		cell.appendChild(label)
		this.el.appendChild(cell)
	}
	{
		let cell = document.createElement("div")
		cell.style.width = this.fieldTypeWidth
		let label = document.createElement("span")
		label.innerText = file.type
		cell.appendChild(label)
		this.el.appendChild(cell)
	}

	return this.el
}

DirectoryNode.prototype.select = function() {
	if (this.el.classList.contains("node_selected")) {
		this.el.classList = "node"
		file.selected = false
	} else {
		this.el.classList = "node node_selected"
		file.selected = true
	}
}
DirectoryNode.prototype.open = function(newTab) {
	if (newTab) {
		window.open(file.href, "_blank")
	} else {
		window.open(file.href)
	}
}
DirectoryNode.prototype.click = function(e) {
	if (e.detail > 1) {
		return // Prevent dblclick from triggering click
	}
	if (e.which == 2) {
		// Middle mouse button opens the file in a new window
		e.preventDefault()
		window.open(file.href, "_blank")
		return
	}


}
DirectoryNode.prototype.doubleClick = function() {
	window.open(file.href)
}

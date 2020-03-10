function DirectoryElement(directoryArea, footer) {
	// Main elements
	this.directoryArea = directoryArea
	this.footer = footer
	this.directorySorters = this.directoryArea.querySelector("#directory_sorters")

	// Create sort buttons

	// Sorting internal state. By default we sort by dateCreated in descending
	// order (new to old)
	this.currentSortField = "dateCreated"
	this.currentSortAscending = false
	this.sortButtons = []

	// Field is the name of the field in the file structure to sort on. Label is
	// the text that appears in the sorting button
	let makeSortButton = (field, label, width) => {
		this.sortButtons[field] = document.createElement("div")
		this.sortButtons[field].innerText = label
		this.sortButtons[field].style.minWidth = width
		this.sortButtons[field].addEventListener("click", () => {
			this.sortBy(field)
		})
		this.directorySorters.appendChild(this.sortButtons[field])
	}

	this.fieldNameWidth = "300px"
	this.fieldDateWidth = "160px"
	this.fieldSizeWidth = "90px"
	this.fieldTypeWidth = "200px"
	makeSortButton("name",        "Name",          this.fieldNameWidth)
	makeSortButton("dateCreated", "Creation Date", this.fieldDateWidth)
	makeSortButton("size",        "Size",          this.fieldSizeWidth)
	makeSortButton("type",        "Type",          this.fieldTypeWidth)


	// Scroll event for rendering new file nodes when they become visible
	this.frameRequested = false;
	this.directoryArea.addEventListener("scroll", (e) => {
		if (this.frameRequested) { return }
		this.frameRequested = true
		requestAnimationFrame(() => {
			this.renderVisibleFiles(false)
			this.frameRequested = false
		})
	})

	// The directory container itself. This is where the files are rendered
	this.dirContainer = document.createElement("div")
	this.dirContainer.classList = "directory_node_container"
	this.directoryArea.appendChild(this.dirContainer)

	// Internal state, contains a list of all files in the directory, visible
	// files in the directory and the last scroll position. These are used for
	// rendering the file list correctly

	// type: {icon, name, href, type, size, sizeLabel, dateCreated, selected}
	this.allFiles     = []

	// This array contains indexes referring to places in the allFiles array
	this.visibleFiles = []

	this.lastSearchTerm = ""
	this.lastScrollTop  = 0
}

DirectoryElement.prototype.reset = function() {
	this.allFiles = []
	this.visibleFiles = []
}

DirectoryElement.prototype.addFile = function(icon, name, href, type, size, sizeLabel, dateCreated) {
	this.allFiles.push({
		icon: icon,
		name: name,
		href: href,
		type: type,
		size: size,
		sizeLabel: sizeLabel,
		dateCreated: dateCreated,
		selected: false,
	})
}

DirectoryElement.prototype.renderFiles = function() {
	this.visibleFiles = []
	for (let i in this.allFiles) {
		this.visibleFiles.push(i)
	}
	this.sortBy("")
}

// search filters the allFiles array on a search term. All files which match the
// search term will be put into visibleFiles. The visibleFiles array will then
// be rendered by renderVisibleFiles
DirectoryElement.prototype.search = function(term) {
	this.lastSearchTerm = term
	this.visibleFiles = []

	if (term === "") {
		for (let i in this.allFiles) {
			this.visibleFiles.push(i)
		}
		this.renderVisibleFiles(true)
		return
	}

	for (let i in this.allFiles) {
		if (this.allFiles[i].name.toLowerCase().includes(term.toLowerCase())) {
			this.visibleFiles.push(i)
		}
	}

	// We have to resort because we modified the visibleFiles array
	this.sortBy("")
	this.renderVisibleFiles(true)
}

DirectoryElement.prototype.sortBy = function(field) {
	if (field === "") {
		// If no sort field is provided we use the last used sort field
		field = this.currentSortField
	} else {
		// If a sort field is provided we check in which direction we have to
		// sort
		if (this.currentSortField !== field) {
			// If this field is a different field than before we sort it in
			// ascending order
			this.currentSortAscending = true
			this.currentSortField = field
		} else if (this.currentSortField === field) {
			// If it is the same field as before re reverse the sort order
			this.currentSortAscending = !this.currentSortAscending
		}
	}

	// Add the arrow to the sort label. First remove the arrow from all sort
	// labels
	for (let el in this.sortButtons) {
		this.sortButtons[el].innerText = this.sortButtons[el].innerText.replace("▲ ", "").replace("▼ ", "")
	}

	// Then prepend the arrow to the current sort label
	if (this.currentSortAscending) {
		this.sortButtons[field].innerText = "▼ "+this.sortButtons[field].innerText
	} else {
		this.sortButtons[field].innerText = "▲ "+this.sortButtons[field].innerText
	}

	let fieldA, fieldB
	this.visibleFiles.sort((a, b) => {
		fieldA = this.allFiles[a][this.currentSortField]
		fieldB = this.allFiles[b][this.currentSortField]

		if (typeof(fieldA) === "number") {
			if (this.currentSortAscending) {
				return fieldA - fieldB
			} else {
				return fieldB - fieldA
			}
		} else {
			if (this.currentSortAscending) {
				return fieldA.localeCompare(fieldB)
			} else {
				return fieldB.localeCompare(fieldA)
			}
		}
	})
	this.renderVisibleFiles(true)
}

DirectoryElement.prototype.createFileButton = function(file, index) {
	let el = document.createElement("a")
	el.classList = "node"
	el.href = file.href
	el.target = "_blank"
	el.title = file.name
	el.setAttribute("fileindex", index)

	{
		let cell = document.createElement("div")
		cell.style.minWidth = this.fieldNameWidth
		let thumb = document.createElement("img")
		thumb.src = file.icon
		cell.appendChild(thumb)
		let label = document.createElement("span")
		label.innerText = file.name
		cell.appendChild(label)
		cell.appendChild(label)
		el.appendChild(cell)
	}
	{
		let cell = document.createElement("div")
		cell.style.minWidth = this.fieldDateWidth
		let label = document.createElement("span")
		label.innerText = printDate(new Date(file.dateCreated), true, true, false)
		cell.appendChild(label)
		el.appendChild(cell)
	}
	{
		let cell = document.createElement("div")
		cell.style.minWidth = this.fieldSizeWidth
		let label = document.createElement("span")
		label.innerText = file.sizeLabel
		cell.appendChild(label)
		el.appendChild(cell)
	}
	{
		let cell = document.createElement("div")
		cell.style.minWidth = this.fieldTypeWidth
		let label = document.createElement("span")
		label.innerText = file.type
		cell.appendChild(label)
		el.appendChild(cell)
	}

	return el
}

// This function dereferences an index in the visibleFiles array to a real file
// in the allFiles array. The notation is a bit confusing so the separate
// function is just for clarity
DirectoryElement.prototype.getVisibleFile = function(index) {
	return this.allFiles[this.visibleFiles[index]]
}

DirectoryElement.prototype.renderVisibleFiles = function(freshStart) {
	let scrollDown = this.lastScrollTop <= this.directoryArea.scrollTop
	this.lastScrollTop = this.directoryArea.scrollTop

	let fileHeight     = 40
	let totalHeight    = (this.visibleFiles.length * fileHeight)
	let viewportHeight = this.directoryArea.clientHeight

	if (freshStart) {
		this.dirContainer.innerHTML = ""
		this.dirContainer.style.height = totalHeight+"px"
		scrollDown = true

		let totalSize = 0
		for (let i in this.visibleFiles) {
			totalSize += this.getVisibleFile(i).size
		}
		this.footer.innerText = this.visibleFiles.length+" items. Total size: "+formatDataVolume(totalSize, 4)
	}

	let paddingTop = this.lastScrollTop - this.lastScrollTop%fileHeight
	let start = Math.floor(paddingTop/fileHeight) - 5
	if (start < 0) { start = 0 }

	let end = Math.ceil((paddingTop+viewportHeight)/fileHeight) + 5
	if (end > this.visibleFiles.length) { end = this.visibleFiles.length-1 }

	this.dirContainer.style.paddingTop = (start*fileHeight)+"px"

	// Remove the elements which are out of bounds
	let firstEl
	let firstIdx = -1
	let lastEl
	let lastIdx = -1
	while (!freshStart) {
		firstEl  = this.dirContainer.firstElementChild
		if (firstEl === null) { break }
		firstIdx = Number.parseInt(firstEl.getAttribute("fileindex"))
		lastEl   = this.dirContainer.lastElementChild
		lastIdx  = Number.parseInt(lastEl.getAttribute("fileindex"))

		if (firstIdx < start) {
			this.dirContainer.removeChild(firstEl)
			console.debug("Remove start "+firstIdx)
		} else if (lastIdx > end) {
			this.dirContainer.removeChild(lastEl)
			console.debug("Remove end "+lastIdx)
		} else {
			break
		}
	}

	console.debug(
		"start "+start+
		" end "+end+
		" firstIdx "+firstIdx+
		" lastIdx "+lastIdx+
		" freshStart "+freshStart+
		" scrollDown "+scrollDown+
		" children "+this.dirContainer.childElementCount
	)

	// Then add the elements which have become visible. When the user scrolls
	// down we can append the items in chronologic order, but when the user
	// scrolls up we have to prepend the items in reverse order to avoid them
	// appearing from high to low.
	if (scrollDown) {
		for (let i = start; i <= end && i < this.visibleFiles.length; i++) {
			if (lastIdx !== -1 && i <= lastIdx) {
				continue
			}
			this.dirContainer.append(this.createFileButton(this.getVisibleFile(i), i))
			console.debug("Append "+i);
		}
	} else {
		for (let i = end; i >= start; i--) {
			if (firstIdx !== -1 && i >= firstIdx) {
				continue
			}
			this.dirContainer.prepend(this.createFileButton(this.getVisibleFile(i), i))
			console.debug("Prepend "+i);
		}
	}
}

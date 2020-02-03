function FileManager(windowElement) {
	this.window           = windowElement
	this.navBar           = this.window.querySelector("#nav_bar")
	this.btnMenu          = this.navBar.querySelector("#btn_menu")
	this.btnBack          = this.navBar.querySelector("#btn_back")
	this.btnUp            = this.navBar.querySelector("#btn_up")
	this.btnForward       = this.navBar.querySelector("#btn_forward")
	this.btnHome          = this.navBar.querySelector("#btn_home")
	this.breadcrumbs      = this.navBar.querySelector("#breadcrumbs")
	this.btnReload        = this.navBar.querySelector("#btn_reload")
	this.inputSearch      = this.navBar.querySelector("#input_search")

	// Buttons
	this.btnReload.addEventListener("click", () => { this.getUserFiles() })

	// Register keyboard shortcuts
	document.addEventListener("keydown", e => { this.keyboardEvent(e) })

	this.inputSearch.addEventListener("keyup", e => {
		if (e.keyCode === 27) {
			e.preventDefault()
			this.inputSearch.blur()
			return
		}
		requestAnimationFrame(() => {
			this.directoryElement.search(this.inputSearch.value)
		})
	})

	this.directoryElement = new DirectoryElement(
		this.window.querySelector("#directory_area"),
		this.window.querySelector("#directory_footer"),
	)
}

FileManager.prototype.setSpinner = function() {
	this.window.appendChild(document.getElementById("tpl_spinner").content.cloneNode(true))
}
FileManager.prototype.delSpinner = function() {
	for (let i in this.window.children) {
		if (
			typeof(this.window.children[i].classList) === "object" &&
			this.window.children[i].classList.contains("spinner")
		) {
			this.window.children[i].remove()
		}
	}
}

FileManager.prototype.getDirectory = function(path) {
	console.log("ayy!")
}

FileManager.prototype.getUserFiles = function() {
	this.setSpinner()

	let getAll = (page) => {
		let numFiles = 10000
		fetch(apiEndpoint+"/user/files?page="+page+"&limit="+numFiles).then(resp => {
			if (!resp.ok) { Promise.reject("yo") }
			return resp.json()
		}).then(resp => {
			for (let i in resp.files) {
				this.directoryElement.addFile(
					apiEndpoint+"/file/"+resp.files[i].id+"/thumbnail?width=32&height=32",
					resp.files[i].name,
					"/u/"+resp.files[i].id,
					resp.files[i].mime_type,
					resp.files[i].size,
					formatDataVolume(resp.files[i].size, 4),
					resp.files[i].date_upload,
				)
			}

			this.directoryElement.renderFiles()

			if (resp.files.length === numFiles) {
				getAll(page+1)
			} else {
				// Less than the maximum number of results means we're done
				// loading, we can remove the loading spinner
				this.delSpinner()
			}
		}).catch((err) => {
			this.delSpinner()
			throw(err)
		})
	}

	this.directoryElement.reset()
	getAll(0)
}

FileManager.prototype.getUserLists = function() {
	this.setSpinner()

	let getAll = (page) => {
		let numFiles = 10000
		fetch(apiEndpoint+"/user/lists?page="+page+"&limit="+numFiles).then(resp => {
			if (!resp.ok) { Promise.reject("yo") }
			return resp.json()
		}).then(resp => {
			for (let i in resp.lists) {
				this.directoryElement.addFile(
					apiEndpoint+"/list/"+resp.lists[i].id+"/thumbnail?width=32&height=32",
					resp.lists[i].title,
					"/l/"+resp.lists[i].id,
					"list",
					resp.lists[i].file_count,
					resp.lists[i].file_count+" files",
					resp.lists[i].date_created,
				)
			}

			this.directoryElement.renderFiles()

			if (resp.lists.length === numFiles) {
				getAll(page+1)
			} else {
				// Less than the maximum number of results means we're done
				// loading, we can remove the loading spinner
				this.delSpinner()
			}
		}).catch((err) => {
			this.delSpinner()
			throw(err)
		})
	}

	this.directoryElement.reset()
	getAll(0)
}

FileManager.prototype.keyboardEvent = function(e) {
	console.log("Pressed: "+e.keyCode)

	// CTRL + F or "/" opens the search bar
	if (e.ctrlKey && e.keyCode === 70 || !e.ctrlKey && e.keyCode === 191) {
		e.preventDefault()
		this.inputSearch.focus()
	}
}

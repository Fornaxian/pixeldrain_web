function Viewer(type, viewToken, data) {
	// Set defaults
	this.toolbar        = null
	this.listNavigator  = null
	this.detailsWindow  = null
	this.divFilepreview = null
	this.file           = null
	this.title          = "" // Contains either the file name or list title
	this.listId         = ""
	this.viewToken      = ""
	this.isList         = false
	this.isFile         = false
	this.initialized    = false

	this.viewToken     = viewToken
	this.toolbar       = new Toolbar(this)
	this.detailsWindow = new DetailsWindow(this)
	this.editWindow    = new EditWindow()

	this.divFilepreview = document.getElementById("filepreview")

	// On small screens the toolbar takes too much space, so it collapses
	// automatically
	if (this.divFilepreview.clientWidth > 600 && !this.toolbar.visible) {
		this.toolbar.toggle()
	}

	if (type === "file") {
		this.isFile = true
		this.title = data.name
		this.setFile(fileFromAPIResp(data))
	} else if (type === "list") {
		this.isList = true
		this.listId = data.id
		this.title = data.title

		let files = []
		for (let i in data.files) {
			files.push(fileFromAPIResp(data.files[i]))
		}
		this.listNavigator = new ListNavigator(this, files)
	} else if (type === "skylink") {
		this.isFile = true
		this.title = data.name
		document.getElementById("btn_details").remove()
		document.getElementById("stat_views_label").remove()
		document.getElementById("stat_views").remove()
		document.getElementById("stat_downloads_label").remove()
		document.getElementById("stat_downloads").remove()
		this.setFile(fileFromSkyNet(data))
	}

	this.renderSponsors()
	window.addEventListener("resize", e => { this.renderSponsors() })

	// Register keyboard shortcuts
	document.addEventListener("keydown", e => { this.keyboardEvent(e) })

	this.initialized = true
}

Viewer.prototype.getFile = function() {
	return this.file
}

Viewer.prototype.setFile = function(file) {
	this.file = file

	if (this.isList) {
		document.getElementById("file_viewer_headerbar_title").style.lineHeight = "1em"
		document.getElementById("file_viewer_list_title").innerText = this.title
		document.getElementById("file_viewer_file_title").innerText = file.name
		document.title = this.title + " ~ " + file.name + " ~ pixeldrain"
	} else {
		document.getElementById("file_viewer_file_title").innerText = file.name
		document.title = file.name + " ~ pixeldrain"
	}

	// Relay the file change event to all components
	this.detailsWindow.setFile(file)
	this.editWindow.setFile(file)
	this.toolbar.setFile(file)

	// Register a new view. We don't care what this returns becasue we can't
	// do anything about it anyway
	if (file.view_href !== "") {
		fetch(file.view_href, {
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded"},
				body: "token="+this.viewToken
			}
		)
	}

	// Clear the canvas
	this.divFilepreview.innerHTML = ""

	let nextItem = () => {
		if (this.listNavigator !== null) {
			this.listNavigator.nextItem()
		}
	}

	if (
		file.mime_type.startsWith("image")
	) {
		new ImageViewer(this, file).render(this.divFilepreview)
	} else if (
		file.mime_type.startsWith("video") ||
		file.mime_type === "application/matroska" ||
		file.mime_type === "application/x-matroska"
	) {
		new VideoViewer(this, file, nextItem).render(this.divFilepreview)
	} else if (
		file.mime_type.startsWith("audio") ||
		file.mime_type === "application/ogg" ||
		file.name.endsWith(".mp3")
	) {
		new AudioViewer(this, file, nextItem).render(this.divFilepreview)
	} else if (
		file.mime_type === "application/pdf" ||
		file.mime_type === "application/x-pdf"
	) {
		new PDFViewer(this, file).render(this.divFilepreview)
	} else if (
		file.mime_type.startsWith("text") ||
		file.id === "demo"
	) {
		new TextViewer(this, file).render(this.divFilepreview)
	} else {
		new FileViewer(this, file).render(this.divFilepreview)
	}
}

Viewer.prototype.renderSponsors = function() {
	// Check if the ad is enabled
	if (document.querySelector(".sponsors_banner") == null) { return }

	let scaleWidth      = 1
	let scaleHeight     = 1
	let minWindowHeight = 800
	let bannerWidth     = document.querySelector(".sponsors_banner").offsetWidth
	let bannerHeight    = document.querySelector(".sponsors_banner").offsetHeight

	if (window.innerWidth < bannerWidth) {
		scaleWidth = window.innerWidth/bannerWidth
	}
	if (window.innerHeight < minWindowHeight) {
		scaleHeight = window.innerHeight/minWindowHeight
	}

	// The smaller scale is the scale we'll use
	let scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight

	// Because of the scale transformation the automatic margins don't work
	// anymore. So we have to manually calculate the margin. Here we take the
	// width of the viewport - the width of the ad to calculate the amount of
	// pixels around the ad. We multiply the ad size by the scale we calcualted
	// to account for the smaller size.
	let offset = (window.innerWidth - (bannerWidth*scale)) / 2

	document.querySelector(".sponsors").style.height = (bannerHeight*scale)+"px"
	document.querySelector(".sponsors_banner").style.marginLeft = offset+"px"
	document.querySelector(".sponsors_banner").style.transform = "scale("+scale+")"
}

Viewer.prototype.keyboardEvent = function(evt) {
	if (evt.ctrlKey || evt.altKey || evt.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}

	console.debug("Key pressed: "+evt.keyCode)
	switch (evt.keyCode) {
	case 65: // A or left arrow key go to previous file
	case 37:
		if (this.listNavigator != null) {
			this.listNavigator.previousItem()
		}
		break
	case 68: // D or right arrow key go to next file
	case 39:
		if (this.listNavigator != null) {
			this.listNavigator.nextItem()
		}
		break
	case 83:
		if (evt.shiftKey) {
			this.listNavigator.downloadList() // SHIFT + S downloads all files in list
		} else {
			this.toolbar.download() // S to download the current file
		}
		break
	case 82: // R to toggle list shuffle
		if (this.listNavigator != null) {
			this.listNavigator.toggleShuffle()
		}
		break
	case 67: // C to copy to clipboard
		this.toolbar.copyUrl()
		break
	case 73: // I to open the details window
		this.detailsWindow.toggle()
		break
	case 69: // E to open the edit window
		this.editWindow.toggle()
		break
	case 81: // Q to close the window
		window.close()
		break
	}
}


// Against XSS attacks
function escapeHTML(str) {
    return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function fileFromAPIResp(resp) {
	resp.date_created    = new Date(resp.date_upload)
	resp.date_last_view  = new Date(resp.date_last_view)
	resp.icon_href       = apiEndpoint+"/file/"+resp.id+"/thumbnail"
	resp.get_href        = apiEndpoint+"/file/"+resp.id
	resp.download_href   = apiEndpoint+"/file/"+resp.id+"?download"
	resp.view_href       = apiEndpoint+"/file/"+resp.id+"/view"
	resp.timeseries_href = apiEndpoint+"/file/"+resp.id+"/timeseries"
	resp.stats_href      = apiEndpoint+"/file/"+resp.id+"/stats"
	resp.link            = domainURL()+"/u/"+resp.id
	if (resp.description === undefined) {
		resp.description = ""
	}

	console.debug("New file:")
	console.debug(resp)

	return resp
}
function fileFromSkyNet(resp) {
	let file = fileFromAPIResp(resp)
	file.icon_href         = "/res/img/mime/empty.png"
	file.get_href          = "https://skydrain.net/file/"+resp.id
	file.download_href     = "https://skydrain.net/file/"+resp.id+"?attachment=1"
	file.view_href         = ""
	file.timeseries_href   = ""
	file.stats_href        = ""
	file.link              = domainURL()+"/s/"+resp.id
	return file
}

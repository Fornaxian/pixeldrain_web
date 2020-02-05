function Viewer(type, viewToken, data) {
	// Set defaults
	this.toolbar        = null
	this.listNavigator  = null
	this.detailsWindow  = null
	this.divFilepreview = null
	this.title          = "" // Contains either the file name or list title
	this.listId         = ""
	this.viewToken      = ""
	this.isList         = false
	this.isFile         = false
	this.initialized    = false

	this.viewToken     = viewToken
	this.toolbar       = new Toolbar(this)
	this.detailsWindow = new DetailsWindow(this)

	this.divFilepreview = document.getElementById("filepreview")

	// On small screens the toolbar takes too much space, so it collapses
	// automatically
	if (this.divFilepreview.clientWidth > 600 && !this.toolbar.visible) {
		this.toolbar.toggle()
	}

	// The close button only works if the window has an opener. So we hide
	// the button if it does not
	if (window.opener === null && window.history.length !== 1) {
		document.getElementById("button_close_file_viewer").remove()
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
	window.addEventListener("resize", e => { this.renderSponsors(e) })

	// Register keyboard shortcuts
	document.addEventListener("keydown", e => { this.keyboardEvent(e) })

	this.initialized = true
}

Viewer.prototype.setFile = function(file) {
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
	let scale       = 1
	let scaleWidth  = 1
	let scaleHeight = 1
	let minWidth    = 728
	let minHeight   = 800

	if (window.innerWidth < minWidth) {
		scaleWidth = window.innerWidth/minWidth
	}
	if (window.innerHeight < minHeight) {
		scaleHeight = window.innerHeight/minHeight
	}
	scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight

	// Because of the scale transformation the automatic margins don't work
	// anymore. So we have to maunally calculate the margin. Where we take the
	// width of the viewport - the width of the ad to calculate the amount of
	// pixels around the ad. We multiply the ad size by the scale we calcualted
	// to account for the smaller size.
	let offset = (window.innerWidth - (minWidth*scale)) / 2
	if (offset < 0) {
		offset = 0
	}
	document.querySelector(".sponsors > iframe").style.marginLeft = offset+"px"

	if (scale == 1) {
		document.querySelector(".sponsors > iframe").style.transform = "none"
		document.querySelector(".sponsors").style.height = "90px"
	} else {
		document.querySelector(".sponsors > iframe").style.transform = "scale("+scale+")"
		document.querySelector(".sponsors").style.height = (scale*90)+"px"
	}
}

Viewer.prototype.keyboardEvent = function(evt) {
	if (evt.ctrlKey || evt.altKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}

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
	let file = {
		id:                resp.id,
		name:              resp.name,
		mime_type:         resp.mime_type,
		size:              resp.size,
		date_created:      new Date(resp.date_upload),
		date_last_view:    new Date(resp.date_last_view),
		views:             resp.views,
		bandwidth_used:    resp.bandwidth_used,
		description:       "",
		icon_href:         apiEndpoint+"/file/"+resp.id+"/thumbnail",
		get_href:          apiEndpoint+"/file/"+resp.id,
		download_href:     apiEndpoint+"/file/"+resp.id+"?download",
		availability_href: apiEndpoint+"/file/"+resp.id+"/availability",
		view_href:         apiEndpoint+"/file/"+resp.id+"/view",
		timeseries_href:   apiEndpoint+"/file/"+resp.id+"/timeseries",
		link:              domainURL()+"/u/"+resp.id,
	}
	if (resp.description !== undefined) {
		file.description = resp.description
	}
	return file
}
function fileFromSkyNet(resp) {
	let file = fileFromAPIResp(resp)
	file.icon_href         = "/res/img/mime/empty.png"
	file.get_href          = "https://sky.pixeldrain.com/"+resp.id
	file.download_href     = "https://sky.pixeldrain.com/"+resp.id+"?attachment=1"
	file.availability_href = ""
	file.view_href         = ""
	file.timeseries_href   = ""
	file.link              = domainURL()+"/s/"+resp.id
	return file
}

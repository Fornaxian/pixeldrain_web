function Viewer(type, viewToken, data) {
	// Set defaults
	this.toolbar       = null;
	this.listNavigator = null;
	this.detailsWindow = null;
	this.divFilepreview = null;
	this.currentFile = "";
	this.title       = ""; // Contains either the file name or list title
	this.listId      = "";
	this.viewToken   = "";
	this.isList      = false;
	this.isFile      = false;
	this.initialized = false;

	this.viewToken     = viewToken;
	this.toolbar       = new Toolbar(this);
	this.detailsWindow = new DetailsWindow(this);

	this.divFilepreview = document.getElementById("filepreview");

	// On small screens the toolbar takes too much space, so it collapses
	// automatically
	if (this.divFilepreview.clientWidth > 600 && !this.toolbar.visible) {
		this.toolbar.toggle();
	}

	// The close button only works if the window has an opener. So we hide
	// the button if it does not
	if (window.opener === null && window.history.length !== 1) {
		document.getElementById("button_close_file_viewer").remove()
	}

	if (type === "file") {
		this.isFile = true;
		this.currentFile = data.id;
		this.title = data.name;
		this.setFile(data);
	} else if (type === "list") {
		this.isList = true;
		this.listId = data.id;
		this.title = data.title;
		this.listNavigator = new ListNavigator(this, data.files);
	}

	this.renderSponsors();
	window.addEventListener("resize", e => { this.renderSponsors(e); });

	// Register keyboard shortcuts
	document.addEventListener("keydown", e => { this.keyboardEvent(e); });

	this.initialized = true;
}

Viewer.prototype.setFile = function(file) {
	this.currentFile = file.id;
	if (this.isList) {
		document.getElementById("file_viewer_headerbar_title").style.lineHeight = "1em";
		document.getElementById("file_viewer_list_title").innerText = this.title;
		document.getElementById("file_viewer_file_title").innerText = file.name;
		document.title = this.title + " ~ " + file.name + " ~ pixeldrain";
	} else {
		document.getElementById("file_viewer_file_title").innerText = file.name;
		document.title = file.name + " ~ pixeldrain";
	}

	// Update the file details
	this.detailsWindow.setDetails(file);
	this.toolbar.setStats(file);

	// Register a new view. We don't care what this returns becasue we can't
	// do anything about it anyway
	fetch(apiEndpoint+"/file/"+file.id+"/view",
		{
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: "token="+this.viewToken
		}
	);

	// Clear the canvas
	this.divFilepreview.innerHTML = "";

	let nextItem = () => {
		if (this.listNavigator !== null) {
			this.listNavigator.nextItem();
		}
	};

	if (
		file.mime_type.startsWith("image")
	) {
		new ImageViewer(this, file).render(this.divFilepreview);
	} else if (
		file.mime_type.startsWith("video") ||
		file.mime_type === "application/matroska" ||
		file.mime_type === "application/x-matroska"
	) {
		new VideoViewer(this, file, nextItem).render(this.divFilepreview);
	} else if (
		file.mime_type.startsWith("audio") ||
		file.mime_type === "application/ogg" ||
		file.name.endsWith(".mp3")
	) {
		new AudioViewer(this, file, nextItem).render(this.divFilepreview);
	} else if (
		file.mime_type === "application/pdf" ||
		file.mime_type === "application/x-pdf"
	) {
		new PDFViewer(this, file).render(this.divFilepreview);
	} else if (
		file.mime_type.startsWith("text") ||
		file.id === "demo"
	) {
		new TextViewer(this, file).render(this.divFilepreview);
	} else {
		new FileViewer(this, file).render(this.divFilepreview);
	}
}

Viewer.prototype.renderSponsors = function() {
	let scale       = 1;
	let scaleWidth  = 1;
	let scaleHeight = 1;
	let minWidth    = 728;
	let minHeight   = 800;

	if (window.innerWidth < minWidth) {
		scaleWidth = window.innerWidth/minWidth;
	}
	if (window.innerHeight < minHeight) {
		scaleHeight = window.innerHeight/minHeight;
	}
	scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;

	// Because of the scale transformation the automatic margins don't work
	// anymore. So we have to maunally calculate the margin. Where we take the
	// width of the viewport - the width of the ad to calculate the amount of
	// pixels around the ad. We multiply the ad size by the scale we calcualted
	// to account for the smaller size.
	let offset = (window.innerWidth - (minWidth*scale)) / 2
	if (offset < 0) {
		offset = 0
	}
	document.querySelector(".sponsors > iframe").style.marginLeft = offset+"px";

	if (scale == 1) {
		document.querySelector(".sponsors > iframe").style.transform = "none";
		document.querySelector(".sponsors").style.height = "90px";
	} else {
		document.querySelector(".sponsors > iframe").style.transform = "scale("+scale+")";
		document.querySelector(".sponsors").style.height = (scale*90)+"px";
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
			this.listNavigator.previousItem();
		}
		break;
	case 68: // D or right arrow key go to next file
	case 39:
		if (this.listNavigator != null) {
			this.listNavigator.nextItem();
		}
		break;
	case 83:
		if (evt.shiftKey) {
			this.listNavigator.downloadList(); // SHIFT + S downloads all files in list
		} else {
			this.toolbar.download(); // S to download the current file
		}
		break;
	case 82: // R to toggle list shuffle
		if (this.listNavigator != null) {
			this.listNavigator.toggleShuffle();
		}
		break;
	case 67: // C to copy to clipboard
		this.toolbar.copyUrl();
		break;
	case 73: // I to open the details window
		this.detailsWindow.toggle();
		break;
	case 81: // Q to close the window
		window.close();
		break;
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

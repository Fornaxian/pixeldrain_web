function Viewer(type, viewToken, data) {let v = this;
	// Set defaults
	v.toolbar       = null;
	v.listNavigator = null;
	v.detailsWindow = null;
	v.divFilepreview = null;
	v.currentFile = "";
	v.title       = ""; // Contains either the file name or list title
	v.listId      = "";
	v.viewToken   = "";
	v.isList      = false;
	v.isFile      = false;
	v.initialized = false;

	v.viewToken     = viewToken;
	v.toolbar       = new Toolbar(v);
	v.detailsWindow = new DetailsWindow(v);

	v.divFilepreview = document.getElementById("filepreview");

	// On small screens the toolbar takes too much space, so it collapses
	// automatically
	if (v.divFilepreview.clientWidth > 600 && !v.toolbar.visible) {
		v.toolbar.toggle();
	}

	// The close button only works if the window has an opener. So we hide
	// the button if it does not
	if (window.opener === null && window.history.length !== 1) {
		document.getElementById("button_close_file_viewer").remove()
	}

	if (type === "file") {
		v.isFile = true;
		v.currentFile = data.id;
		v.title = data.name;
		v.setFile(data);
	} else if (type === "list") {
		v.isList = true;
		v.listId = data.id;
		v.title = data.title;
		v.listNavigator = new ListNavigator(v, data.data);
	}

	v.renderSponsors();
	window.addEventListener("resize", e => { v.renderSponsors(e); });

	// Register keyboard shortcuts
	document.addEventListener("keydown", e => { v.keyboardEvent(e); });

	v.initialized = true;
}

Viewer.prototype.setFile = function(file) {let v = this;
	v.currentFile = file.id;
	if (v.isList) {
		document.getElementById("file_viewer_headerbar_title").style.lineHeight = "1em";
		document.getElementById("file_viewer_list_title").innerText = this.title;
		document.getElementById("file_viewer_file_title").innerText = file.name;
		document.title = v.title + " ~ " + file.name + " ~ pixeldrain";
	} else {
		document.getElementById("file_viewer_file_title").innerText = file.name;
		document.title = file.name + " ~ pixeldrain";
	}

	// Update the file details
	v.detailsWindow.setDetails(file);
	v.toolbar.setStats(file);

	// Register a new view. We don't care what this returns becasue we can't
	// do anything about it anyway
	fetch(apiEndpoint+"/file/"+file.id+"/view",
		{
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: "token="+v.viewToken
		}
	);

	// Clear the canvas
	v.divFilepreview.innerHTML = "";

	let nextItem = () => {
		if (v.listNavigator !== null) {
			v.listNavigator.nextItem();
		}
	};

	if (
		file.mime_type.startsWith("image")
	) {
		new ImageViewer(v, file).render(v.divFilepreview);
	} else if (
		file.mime_type.startsWith("video") ||
		file.mime_type === "application/matroska" ||
		file.mime_type === "application/x-matroska"
	) {
		new VideoViewer(v, file, nextItem).render(v.divFilepreview);
	} else if (
		file.mime_type.startsWith("audio") ||
		file.mime_type === "application/ogg" ||
		file.name.endsWith(".mp3")
	) {
		new AudioViewer(v, file, nextItem).render(v.divFilepreview);
	} else if (
		file.mime_type === "application/pdf" ||
		file.mime_type === "application/x-pdf"
	) {
		new PDFViewer(v, file).render(v.divFilepreview);
	} else if (
		file.mime_type.startsWith("text") ||
		file.id === "demo"
	) {
		new TextViewer(v, file).render(v.divFilepreview);
	} else {
		new FileViewer(v, file).render(v.divFilepreview);
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

Viewer.prototype.keyboardEvent = function(evt) {let v = this;
	if (evt.ctrlKey || evt.altKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}

	switch (evt.keyCode) {
	case 65: // A or left arrow key go to previous file
	case 37:
		if (v.listNavigator != null) {
			v.listNavigator.previousItem();
		}
		break;
	case 68: // D or right arrow key go to next file
	case 39:
		if (v.listNavigator != null) {
			v.listNavigator.nextItem();
		}
		break;
	case 83:
		if (evt.shiftKey) {
			v.listNavigator.downloadList(); // SHIFT + S downloads all files in list
		} else {
			v.toolbar.download(); // S to download the current file
		}
		break;
	case 82: // R to toggle list shuffle
		if (v.listNavigator != null) {
			v.listNavigator.toggleShuffle();
		}
		break;
	case 67: // C to copy to clipboard
		v.toolbar.copyUrl();
		break;
	case 73: // I to open the details window
		v.detailsWindow.toggle();
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

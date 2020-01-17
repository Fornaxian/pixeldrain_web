/* global ListNavigator, Toolbar, DetailsWindow */

var Viewer = {
	currentFile: "",
	title: "", // Contains either the file name or list title
	listId: "",
	isList: false,
	isFile: false,
	initialized: false,

	init: function(type, data){
		if(this.initialized){
			return;
		}

		// On small screens the toolbar takes too much space, so it collapses automatically
		if($("#filepreview").width() > 600 && !Toolbar.visible){
			Toolbar.toggle();
		}

		// The close button only works if the window has an opener. So we hide
		// the button if it does not
		if (window.opener === null && window.history.length !== 1) {
			$("#button_close_file_viewer").remove();
		}

		if(type === "file"){
			this.isFile = true;
			this.currentFile = data.id;
			this.title = data.name;
			this.setFile(data);
		} else if (type === "list") {
			this.isList = true;
			this.listId = data.id;
			this.title = data.title;
			ListNavigator.init(data.data);
		}

		renderSponsors();

		this.initialized = true;
	},
	setFile: function(file){
		this.currentFile = file.id;
		var title = "";
		if (this.isList) {
			document.getElementById("file_viewer_headerbar_title").style.lineHeight = "1em";
			document.getElementById("file_viewer_list_title").innerText = this.title;
			document.getElementById("file_viewer_file_title").innerText = file.name;
			document.title = this.title + " ~ " + file.name + " ~ pixeldrain";
		} else {
			document.getElementById("file_viewer_file_title").innerText = file.name;
			document.title = file.name + " ~ pixeldrain";
		}

		$.get("/u/" + file.id + "/preview", function(response){
			$("#filepreview").html(response);
		});

		DetailsWindow.setDetails(file);
	}
};

// Against XSS attacks
function escapeHTML(str) {
    return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

// Register keyboard shortcuts
document.addEventListener("keydown", function(event){
	if (event.ctrlKey || event.altKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}

	switch (event.which) {
	case 65: // A or left arrow key go to previous file
	case 37:
		ListNavigator.previousItem();
		break;
	case 68: // D or right arrow key go to next file
	case 39:
		ListNavigator.nextItem();
		break;
	case 83:
		if (event.shiftKey) {
			Toolbar.downloadList(); // SHIFT + S downloads all files in list
		} else {
			Toolbar.download(); // S to download the current file
		}
		break;
	case 82: // R to toggle list shuffle
		ListNavigator.toggleShuffle();
		break;
	case 67: // C to copy to clipboard
		Toolbar.copyUrl();
		break;
	case 73: // I to open the details window
		DetailsWindow.toggle();
		break;
	case 81: // Q to close the window
		window.close();
		break;
	}
});


window.addEventListener("resize", renderSponsors);
function renderSponsors() {
	var scale = 1;
	var scaleWidth = 1;
	var scaleHeight = 1;
	var minWidth = 728;
	var minHeight = 800;

	if (window.innerWidth < minWidth) {
		scaleWidth = window.innerWidth/minWidth;
	}
	if (window.innerHeight < minHeight) {
		scaleHeight = window.innerHeight/minHeight;
	}
	scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;

	console.log(scale, scaleWidth, scaleHeight);

	// Because of the scale transformation the automatic margins don't work
	// anymore. So we have to maunally calculate the margin. Where we take the
	// width of the viewport - the width of the ad to calculate the amount of
	// pixels around the ad. We multiply the ad size by the scale we calcualted
	// to account for the smaller size.
	var offset = (window.innerWidth - (minWidth*scale)) / 2
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

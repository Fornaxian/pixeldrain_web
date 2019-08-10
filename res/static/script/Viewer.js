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
		if($("#filepreview").width() > 500 && !Toolbar.visible){
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

		this.initialized = true;
	},
	setFile: function(file){
		this.currentFile = file.id;
		var title = "";
		if (this.isList) {
			title = this.title + " ~ " + file.name;
		} else {
			title = file.name;
		}
		document.title = title + " ~ PixelDrain";
		document.getElementById("file_viewer_headerbar_title").innerText = title;

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

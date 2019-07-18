/* global ListNavigator, Toolbar */

$(document).keydown(function(event){
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

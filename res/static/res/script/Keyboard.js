/* global ListNavigator, Toolbar */

$(document).keydown(function(event){
	if(event.which === 65 || event.which === 37){ // A or left arrow key go to previous file
		ListNavigator.previousItem();
	}else if(event.which === 68 || event.which === 39){ // D or right arrow key go to next file
		ListNavigator.nextItem();
	}else if(event.shiftKey && event.which === 83){ // SHIFT + S downloads all files in list
		Toolbar.downloadList();
	}else if(event.which === 83){ // S key downloads only selected file
		Toolbar.download();
	}else if(event.which === 67){ // C to copy to clipboard
		Toolbar.copyUrl();
	}else if(event.which === 73){ // I to open info window
		DetailsWindow.toggle();
	}
});
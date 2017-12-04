/* global ListNavigator, Toolbar, DetailsWindow */

var Viewer = {
	currentFile: "",
	listId: "",
	isList: false,
	isFile: false,
	initialized: false,
	
	init: function(type, data){
		if(this.initialized){
			return;
		}
		
		// On small screens the toolbar takes too much space, so it collapses automatically
		if($("#filepreview").width() < 400 && Toolbar.visible){
			window.setTimeout(function(){
				Toolbar.toggle();
			}, 800);
		}
		
		if(type === "file"){
			this.isFile = true;
			this.currentFile = data.id;
			this.setFile(data);
		} else if (type === "list") {
			this.isList = true;
			this.listId = data.id;
			ListNavigator.init(data.data);
		}
		
		this.initialized = true;
	},
	setFile: function(file){
		this.currentFile = file.id;
		document.title = file.file_name + " ~ PixelDrain";
		
		$.get("/u/" + file.id + "/preview", function(response){
			$("#filepreview").html(response);
		});
		
		DetailsWindow.setDetails(file);
		Toolbar.setViews(file.views);
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
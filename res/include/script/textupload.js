function uploadText() {
	var text = document.getElementById("textarea").value;
	var blob = new Blob([text], {type: "text/plain"});
	var filename = prompt("What do you want to call this piece of textual art?\n\n"
	+ "Please add your own file extension, if you want.",
	"Pixeldrain_Text_File.txt");

	if(filename === null){
		return;
	}

	new UploadManager(apiEndpoint+"/file", null).addFile(
		blob,
		filename,
		null,
		function (id){
			addUploadHistory(id);
			setTimeout(window.location.href = "/u/" + id, 100);
		},
		function (response, error) { alert("File upload failed! The server told us this: " + response); }
	)
}

// Upload the file when ctrl + s is pressed
document.addEventListener("keydown", function(event) {
	if ((event.ctrlKey || event.metaKey) && event.keyCode === 83) {
		event.preventDefault();
		uploadText();
		return false;
	}
});

/**
 * Prevent the Tab key from moving the cursor outside of the text area
 */
document.getElementById("textarea").addEventListener(
	'keydown',
	function(e) {
		if(e.keyCode === 9) { // tab was pressed
			// get caret position/selection
			var start = this.selectionStart;
			var end = this.selectionEnd;

			var target = e.target;
			var value = target.value;

			// set textarea value to: text before caret + tab + text after caret
			target.value = value.substring(0, start) + "\t" + value.substring(end);

			// put caret at right position again (add one for the tab)
			this.selectionStart = this.selectionEnd = start + 1;

			// prevent the focus lose
			e.preventDefault();
		}
	},
	false
);

var uploader: UploadManager|null = null

class TextUpload implements FileUpload {
	constructor(file: Blob, name: string){
		this.file = file
		this.name = name
	}

	// Interface stuff
	public file: Blob;
	public name: string
	public onProgress(progress: number){return}
	public onFinished(id: string){
		setTimeout(window.location.href = "/u/" + id, 100);
	}
	public onFailure(response: JQuery.Ajax.ErrorTextStatus, error: string) {
		alert("File upload failed! The server told us this: " + response);
	}
}

function uploadText() {
	var text = $("#textarea").val();
	var blob = new Blob([text], {type: "text/plain"});
	var filename = prompt("What do you want to call this piece of textual art?\n\n"
	+ "Please add your own file extension, if you want.",
	"Pixeldrain_Text_File.txt");

	if(filename === null){
		return;
	}

	if (uploader === null){
		uploader = new UploadManager()
	}

	uploader.uploadFile(new TextUpload(blob, filename))
}


/**
 * Prevent the Tab key from moving the cursor outside of the text area
 */
$(document).delegate('#textarea', 'keydown', function (e) {
	var keyCode = e.keyCode || e.which;

	if (keyCode === 9) {
		e.preventDefault();
		var start = (<HTMLTextAreaElement>$(this).get(0)).selectionStart;
		var end = (<HTMLTextAreaElement>$(this).get(0)).selectionEnd;

		// set textarea value to: text before caret + tab + text after caret
		$(this).val((<string>$(this).val()).substring(0, start)
			+ "\t"
			+ (<string>$(this).val()).substring(end));

		// put caret at right position again
		(<HTMLTextAreaElement>$(this).get(0)).selectionStart =
			(<HTMLTextAreaElement>$(this).get(0)).selectionEnd = start + 1;
	}
});

// Upload the file when ctrl + s is pressed
$(document).bind('keydown', function (e) {
	if (e.ctrlKey && (e.which === 83)) {
		e.preventDefault();
		uploadText();
		return false;
	}
});

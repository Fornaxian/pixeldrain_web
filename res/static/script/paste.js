/**
 * Made by Fornax
 * Use if you need to
 */

function uploadText() {
	var text = $("#textarea").val();
	var blob = new Blob([text], {type: "text/plain"});

	startFileUpload(blob);
}

/*
 * Upload functions
 */
function startFileUpload(blob) {
	formData = new FormData();
	formData.append('file', blob);

	var filename = prompt("What do you want to call this piece of textual art?\n\n"
		+ "Please add your own file extension, if you want.",
		"Pixeldrain_Text_File.txt");
	
	if(filename === null){
		return;
	}
	
	formData.append("name", filename);

	jQuery.ajax({
		url: "/api/file",
		data: formData,
		cache: false,
		crossDomain: true,
		contentType: false,
		processData: false,
		type: 'POST',
		success: function (data) {
			fileUploadComplete(data);
		}
	});
}

function fileUploadComplete(json) {
	if (json.success) {
		setHistoryCookie(json.id)
		setTimeout(window.location.href = "/u/" + json.id, 100);
	} else {
		alert("File upload failed! The server told us this: " + json.message);
	}
}

function setHistoryCookie(id){
	uc = Cookie.get("pduploads");

	// First upload in this browser
	if (uc === null) {
		Cookie.set("pduploads", id + ".");
		return;
	}

	if (uc.length > 2000){
		// Cookie is becoming too long, drop the oldest two files
		uc = uc.substring(
			uc.indexOf(".") + 1
		).substring(
			uc.indexOf(".") + 1
		);
	}
	
	Cookie.set("pduploads", uc + id + ".");
}

/**
 * Prevent the Tab key from moving the cursor outside of the text area
 */
$(document).delegate('#textarea', 'keydown', function (e) {
	var keyCode = e.keyCode || e.which;

	if (keyCode === 9) {
		e.preventDefault();
		var start = $(this).get(0).selectionStart;
		var end = $(this).get(0).selectionEnd;

		// set textarea value to: text before caret + tab + text after caret
		$(this).val($(this).val().substring(0, start)
			+ "\t"
			+ $(this).val().substring(end));

		// put caret at right position again
		$(this).get(0).selectionStart =
			$(this).get(0).selectionEnd = start + 1;
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

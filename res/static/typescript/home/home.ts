declare var apiEndpoint: string;

class FinishedUpload {
	public id:   string;
	public name: string;
}

var uploader:        UploadManager|null = null;
var finishedUploads: Array<FinishedUpload> = new Array()
var totalUploads:    number = 0

class UploadProgressBar implements FileUpload {
	private uploadDiv:   HTMLAnchorElement
	private uploadDivJQ: JQuery<HTMLElement>
	private queueNum:    number

	constructor(file: File){
		this.file = file
		this.name = file.name
		this.queueNum = totalUploads
		totalUploads++

		this.uploadDiv = document.createElement("a")
		this.uploadDiv.setAttribute("class", "file_button")
		this.uploadDiv.innerText = "Queued\n" + this.file.name
		this.uploadDivJQ = $(this.uploadDiv)

		$("#uploads_queue").append(
			this.uploadDivJQ.hide().fadeIn('slow').css("display", "")
		)
	}

	// Interface stuff
	public file: File
	public name: string
	public onProgress(progress: number){
		this.uploadDiv.innerText = "Uploading... " + Math.round(progress*1000)/10 + "%\n" + this.file.name
		this.uploadDiv.setAttribute(
			'style',
			'background: linear-gradient('
				+'to right, '
				+'var(--file_background_color) 0%, '
				+'var(--highlight_color) '+ ((progress*100)) +'%, '
				+'var(--file_background_color) '+ ((progress*100)+1) +'%)'
		)
	}
	public onFinished(id: string){
		finishedUploads[this.queueNum] = {
			id: id,
			name: this.file.name
		};

		this.uploadDiv.setAttribute('style', 'background: var(--file_background_color)')
		this.uploadDiv.setAttribute('href', '/u/'+id)
		this.uploadDiv.setAttribute("target", "_blank");
		this.uploadDivJQ.html(
			'<img src="'+apiEndpoint+'/file/'+id+'/thumbnail" alt="'+this.file.name+'"/>'
			+ this.file.name+'<br/>'
			+ '<span style="color: var(--highlight_color);">'+window.location.hostname+'/u/'+id+'</span>'
		)
	}
	public onFailure(response: JQuery.Ajax.ErrorTextStatus, error: string) {
		this.uploadDiv.setAttribute('style', 'background: var(--danger_color)')
		this.uploadDivJQ.html(
			this.file.name+'<br/>'
			+ 'Upload failed after three tries!<br/>'
			+ "Message: " + error
		)
	}
}

function handleUploads(files: FileList) {
	if (uploader === null){
		uploader = new UploadManager()

		$("#uploads_queue").animate(
			{"height": "340px"},
			{"duration": 2000, queue: false}
		);
	}

	for (var i = 0; i < files.length; i++) {
		uploader.uploadFile(new UploadProgressBar(files.item(i)))
	}
}

// List creation
function createList(title: string, anonymous: boolean){
	if (uploader.uploading()) {
		var cont = confirm(
			"Some files have not finished uploading yet. Creating a list now "+
				"will exclude those files.\n\nContinue?");
		if (!cont) {
			return;
		}
	}

	var postData = {
		"title": title,
		"anonymous": anonymous,
		"files": new Array()
	};
	for (var i = 0; i < finishedUploads.length; i++) {
		postData.files.push({
			"id": finishedUploads[i].id
		});
	}

	$.ajax({
		url: "/api/list",
		contentType: "application/json",
		method: "POST",
		data: JSON.stringify(postData),
		dataType: "json",
		success: function(response) {
			var resultString = "<div class=\"file_button\">"
				+ '<img src="'+apiEndpoint+'/list/'+response.id+'/thumbnail"/>'
				+ "List creation finished!<br/>"
				+ title + "<br/>"
				+ "<a href=\"/l/" + response.id + "\" target=\"_blank\">"+window.location.hostname+"/l/" + response.id + "</a>"
				+ "</div>";
			$('#uploads_queue').append(
				$(resultString).hide().fadeIn('slow').css("display", "")
			);
			$("#uploads_queue").animate({
				scrollTop: $("#uploads_queue").prop("scrollHeight")
			}, 1000);
			window.open('/l/'+response.id, '_blank');
		},
		error: function(xhr, status, error) {
			console.log("xhr:");
			console.log(xhr);
			console.log("status:");
			console.log(status);
			console.log("error:");
			console.log(error);
			var resultString = "<div class=\"file_button\">List creation failed<br/>"
				+ "The server responded with this: <br/>"
				+ xhr.responseJSON.message
				+ "</div>";
			$('#uploads_queue').append(
				$(resultString).hide().fadeIn('slow').css("display", "")
			);
		}
	});
}

// Form upload handlers

// Relay click event to hidden file field
$("#select_file_button").click(function(){$("#file_input_field").click()})

$("#file_input_field").change(function(evt){
	handleUploads((<HTMLInputElement>evt.target).files)

	// This resets the file input field
	// http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
	$('#file_name').html("")
	$("#file_upload_button").css("visibility", "hidden");
	(<HTMLFormElement>$("#file_input_field").wrap("<form>").closest("form").get(0)).reset()
	$("#file_input_field").unwrap()
})

/*
 * Drag 'n Drop upload handlers
 */
$(document).on('dragover', function (e) {
	e.preventDefault()
	e.stopPropagation()
})
$(document).on('dragenter', function (e) {
	e.preventDefault()
	e.stopPropagation()
})
document.addEventListener('drop', function(e: DragEvent){
	if (e.dataTransfer && e.dataTransfer.files.length > 0) {
		e.preventDefault()
		e.stopPropagation()

		handleUploads(e.dataTransfer.files)
	}
})

// Style selector
$("input[name=style]").change(function(evt){
	Cookie.write("style", evt.target.id.substring(6))
	location.reload()
})

function copyText(text: string) : boolean {
	// Create a textarea to copy the text from
	var ta = document.createElement("textarea");
	ta.setAttribute("readonly", "readonly")
	ta.style.position = "absolute";
	ta.style.left = "-9999px";
	ta.value = text; // Put the text in the textarea

	// Add the textarea to the DOM so it can be seleted by the user
	document.body.appendChild(ta);
	ta.select() // Select the contents of the textarea
	var success = document.execCommand("copy"); // Copy the selected text
	document.body.removeChild(ta); // Remove the textarea
	return success;
}

// Create list button
document.getElementById("btn_create_list").addEventListener("click", function(evt) {
	var title = prompt(
		"You are creating a list containing " + finishedUploads.length + " files.\n"
		+ "What do you want to call it?", "My New Album"
	);
	if(title === null){
		return;
	}
	createList(title, false);
});

var btnCopyLinks = document.getElementById("btn_copy_links");
btnCopyLinks.addEventListener("click", function(){
	var text = "";

	// Add the text to the textarea
	for (var i = 0; i < finishedUploads.length; i++) {
		// Example: https://pixeldrain.com/u/abcd1234: Some_file.png
		text += window.location.protocol + "//" + window.location.hostname + "/u/" + finishedUploads[i].id +
			": " + finishedUploads[i].name + "\n";
	}

	var defaultButtonText = btnCopyLinks.innerHTML;

	// Copy the selected text
	if(copyText(text)){
		btnCopyLinks.classList.add("button_highlight");
		btnCopyLinks.innerHTML = "Links copied to clipboard!"
		// Return to normal
		setTimeout(function(){
			btnCopyLinks.innerHTML = defaultButtonText;
			btnCopyLinks.classList.remove("button_highlight")
		}, 60000);
	}else{
		btnCopyLinks.classList.add("button_red");
		btnCopyLinks.innerHTML = "Copying links failed"
		setTimeout(function(){
			btnCopyLinks.innerHTML = defaultButtonText;
			btnCopyLinks.classList.remove("button_red")
		}, 60000);
	}
});

var btnCopyBBCode = document.getElementById("btn_copy_bbcode");
btnCopyBBCode.addEventListener("click", function(){
	var text = "";

	// Add the text to the textarea
	for (var i = 0; i < finishedUploads.length; i++) {
		// Example: [url=https://pixeldrain.com/u/abcd1234]Some_file.png[/url]
		text += "[url=" + window.location.protocol + "//" + window.location.hostname +
			"/u/" + finishedUploads[i].id + "]" +
			finishedUploads[i].name + "[/url]\n";
	}

	var defaultButtonText = btnCopyBBCode.innerHTML;

	// Copy the selected text
	if(copyText(text)){
		btnCopyBBCode.classList.add("button_highlight");
		btnCopyBBCode.innerHTML = "BBCode copied to clipboard!"
		// Return to normal
		setTimeout(function(){
			btnCopyBBCode.innerHTML = defaultButtonText;
			btnCopyBBCode.classList.remove("button_highlight")
		}, 60000);
	}else{
		btnCopyBBCode.classList.add("button_red");
		btnCopyBBCode.innerHTML = "Copying links failed"
		setTimeout(function(){
			btnCopyBBCode.innerHTML = defaultButtonText;
			btnCopyBBCode.classList.remove("button_red")
		}, 60000);
	}
});

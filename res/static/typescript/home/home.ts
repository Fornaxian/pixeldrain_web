declare var apiEndpoint: string

class FinishedUpload {
	public id:   string
	public name: string
}

var uploader:        UploadManager|null = null
var finishedUploads: Array<FinishedUpload> = new Array()
var totalUploads:    number = 0
var queueDiv = document.getElementById("uploads_queue")

class UploadProgressBar implements FileUpload {
	public  file:      File
	public  name:      string
	private queueNum:  number
	private uploadDiv: HTMLAnchorElement

	constructor(file: File){
		this.file = file
		this.name = file.name
		this.queueNum = totalUploads
		this.uploadDiv = document.createElement("a")
		totalUploads++

		this.uploadDiv.classList.add("file_button")
		this.uploadDiv.style.opacity = "0";
		this.uploadDiv.innerText = "Queued\n" + this.file.name
		queueDiv.appendChild(this.uploadDiv)

		// Browsers don't render the transition if the opacity is set and
		// updated in the same frame. So we have to wait a frame (or more)
		// before changing the opacity to make sure the transition triggers
		var d = this.uploadDiv // `this` stops working after constructor ends
		window.setTimeout(function(){d.style.opacity = "1";}, 100)
	}

	public onProgress(progress: number){
		this.uploadDiv.innerText = "Uploading... " + Math.round(progress*1000)/10 + "%\n" + this.file.name
		this.uploadDiv.style.background = 'linear-gradient('
			+'to right, '
			+'var(--file_background_color) 0%, '
			+'var(--highlight_color) '+ ((progress*100)) +'%, '
			+'var(--file_background_color) '+ ((progress*100)+1) +'%)'
	}
	public onFinished(id: string){
		finishedUploads[this.queueNum] = {
			id: id,
			name: this.file.name
		};
		console.log("Upload finished: "+this.file.name+" "+id);

		this.uploadDiv.style.background = 'var(--file_background_color)'
		this.uploadDiv.href = '/u/'+id
		this.uploadDiv.target= "_blank"

		var fileImg = document.createElement("img")
		fileImg.src = apiEndpoint+'/file/'+id+'/thumbnail'
		fileImg.alt = this.file.name

		var linkSpan = document.createElement("span")
		linkSpan.style.color = "var(--highlight_color)"
		linkSpan.innerText = window.location.hostname+"/u/"+id

		this.uploadDiv.innerHTML = "" // Remove uploading progress
		this.uploadDiv.appendChild(fileImg)
		this.uploadDiv.appendChild(document.createTextNode(this.file.name))
		this.uploadDiv.appendChild(document.createElement("br"))
		this.uploadDiv.appendChild(linkSpan)
	}
	public onFailure(error: string) {
		this.uploadDiv.innerHTML = "" // Remove uploading progress
		this.uploadDiv.style.background = 'var(--danger_color)'
		this.uploadDiv.appendChild(document.createTextNode(this.file.name))
		this.uploadDiv.appendChild(document.createElement("br"))
		this.uploadDiv.appendChild(document.createTextNode("Upload failed after three tries:"))
		this.uploadDiv.appendChild(document.createElement("br"))
		this.uploadDiv.appendChild(document.createTextNode(error))
	}
}


// List creation
function createListFull(title: string, anonymous: boolean){
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
		if (finishedUploads[i].id == "") {
			continue
		}
		postData.files.push({
			"id": finishedUploads[i].id
		});
	}

	var xhr = new XMLHttpRequest()
	xhr.open("POST", apiEndpoint+"/list")
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8")
	xhr.onreadystatechange = function(){
		if (xhr.readyState !== 4) {return;}
		var resp = JSON.parse(xhr.response);

		if (xhr.status < 400) {
			// Request is a success
			var div = document.createElement("div")
			div.className = "file_button";
			div.innerHTML = '<img src="'+apiEndpoint+'/list/'+resp.id+'/thumbnail"/>'
				+ "List creation finished!<br/>"
				+ title + "<br/>"
				+ '<a href="/l/'+resp.id+'" target="_blank">'+window.location.hostname+'/l/'+resp.id+'</a>';
			document.getElementById("created_lists").appendChild(div);
			window.open('/l/'+resp.id, '_blank');
		} else {
			console.log("status: "+xhr.status+" response: "+xhr.response)
			var div = document.createElement("div")
			div.className = "file_button";
			div.innerHTML = "List creation failed<br/>"
				+ "The server responded with:<br/>"
				+ resp.message;
			document.getElementById("created_lists").append(div);
		}
	}

	xhr.send(JSON.stringify(postData));
}

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
	createListFull(title, false);
});

var btnCopyLinks = document.getElementById("btn_copy_links");
btnCopyLinks.addEventListener("click", function(){
	var text = "";

	// Add the text to the textarea
	for (var i = 0; i < finishedUploads.length; i++) {
		// Example: https://pixeldrain.com/u/abcd1234: Some_file.png
		text += window.location.protocol + "//" + window.location.hostname + "/u/" + finishedUploads[i].id +
			" " + finishedUploads[i].name + "\n";
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

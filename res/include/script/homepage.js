function UploadProgressBar(uploadManager, queueDiv, file){
	this.uploadManager = uploadManager
	this.file = file
	this.name = file.name

	this.uploadDiv = document.createElement("a")
	this.uploadDiv.classList.add("file_button")
	this.uploadDiv.style.opacity = "0"
	this.uploadDiv.innerText = "Queued\n" + this.file.name
	queueDiv.appendChild(this.uploadDiv)

	// Start uploading the file
	this.uploadManager.addFile(
		this.file,
		this.name,
		(progress) => { this.onProgress(progress) },
		(id)       => { this.onFinished(id) },
		(val, msg) => { this.onFailure(val, msg) }
	)

	// Browsers don't render the transition if the opacity is set and
	// updated in the same frame. So we have to wait a frame (or more)
	// before changing the opacity to make sure the transition triggers
	window.setTimeout(() => {this.uploadDiv.style.opacity = "1"}, 100)
}

UploadProgressBar.prototype.onProgress = function(progress){
	this.uploadDiv.innerText = "Uploading... " + Math.round(progress*1000)/10 + "%\n" + this.name
	this.uploadDiv.style.background = 'linear-gradient('
		+'to right, '
		+'var(--file_background_color) 0%, '
		+'var(--highlight_color) '+ ((progress*100)) +'%, '
		+'var(--file_background_color) '+ ((progress*100)+1) +'%)'
}
UploadProgressBar.prototype.onFinished = function(id){
	console.log("Upload finished: "+this.file.name+" "+id)

	this.uploadDiv.style.background = 'var(--file_background_color)'
	this.uploadDiv.href = '/u/'+id
	this.uploadDiv.target= "_blank"

	let fileImg = document.createElement("img")
	fileImg.src = apiEndpoint+'/file/'+id+'/thumbnail'
	fileImg.alt = this.file.name

	let linkSpan = document.createElement("span")
	linkSpan.style.color = "var(--highlight_color)"
	linkSpan.innerText = domainURL()+"/u/"+id

	this.uploadDiv.innerHTML = "" // Remove uploading progress
	this.uploadDiv.appendChild(fileImg)
	this.uploadDiv.appendChild(document.createTextNode(this.file.name))
	this.uploadDiv.appendChild(document.createElement("br"))
	this.uploadDiv.appendChild(linkSpan)
}
UploadProgressBar.prototype.onFailure = function(val, msg) {
	if (val === "") {
		val = "Could not connect to server"
	}

	this.uploadDiv.innerHTML = "" // Remove uploading progress
	this.uploadDiv.style.background = 'var(--danger_color)'
	this.uploadDiv.style.color = 'var(--highlight_text_color)'
	this.uploadDiv.appendChild(document.createTextNode("Upload failed: "))
	this.uploadDiv.appendChild(document.createTextNode(msg+" ("+val+")"))
	this.uploadDiv.appendChild(document.createElement("br"))
	this.uploadDiv.appendChild(document.createTextNode(this.file.name))
	console.log(msg)
}


let uploader   = null
let shareTitle = ""
let shareLink  = ""

function handleUploads(files) {
	if (uploader === null){
		uploader = new UploadManager(apiEndpoint, uploadsFinished)
	}

	if (files.length === 0) {
		return
	}

	for (let i = 0; i < files.length; i++) {
		new UploadProgressBar(
			uploader,
			document.getElementById("uploads_queue"),
			files.item(i)
		)
	}

	hideShareButtons()
}

function uploadsFinished() {
	shareLink = ""
	shareTitle = ""

	// Get the finished uploads from the uploader
	let uploadLog = uploader.finishedUploads()

	if (uploadLog.length === 1) {
		shareTitle = "Download "+uploadLog[0].fileName+" here"
		shareLink = domainURL()+"/u/"+uploadLog[0].fileID

		showShareButtons()
	} else if (uploadLog.length > 1) {
		let title = uploadLog.length + " files"

		createList(
			title, true,
		).then(resp => {
			console.log("Automatic list ID "+resp.id)
			shareTitle = "View "+title+" here"
			shareLink = domainURL()+"/l/"+resp.id

			showShareButtons()
		}).catch(err => {
			alert("Failed to generate link. Please check your internet connection and try again.\nError: "+err)
		})
	}
}

function createList(title, anonymous) {
	let uploads = uploader.finishedUploads()
	let files = Array()
	for (let i = 0; i < uploads.length; i++) {
		files.push({ "id": uploads[i].fileID })
	}

	return fetch(
		apiEndpoint+"/list",
		{
			method: "POST",
			headers: {"Content-Type": "application/json; charset=UTF-8"},
			body: JSON.stringify({
				"title": title,
				"anonymous": anonymous,
				"files": files
			})
		}
	).then(resp => {
		if (!resp.ok) {
			return Promise.reject("HTTP error: "+resp.status)
		}
		return resp.json()
	})
}

function hideShareButtons() {
	document.getElementById("instruction_3_after").style.display = "none"
}

function showShareButtons() {
	document.getElementById("instruction_3_after").style.display = ""

	if (window.navigator && window.navigator.share) {
		document.getElementById("social_buttons").style.display = "none"
	} else {
		document.getElementById("navigator_share_button").style.display = "none"
	}
}

function copyLink() {
	if(copyText(shareLink)) {
		console.log('Text copied')
		document.querySelector("#btn_copy_link>span").textContent = "Copied!"
		document.getElementById("btn_copy_link").classList.add("button_highlight")
	} else {
		console.log('Copying not supported')
		alert("Your browser does not support copying text.")
	}
}

/*
 * Upload Handlers
 */

 // Relay click event to hidden file field
document.getElementById("upload_file_button").onclick = function() {
	document.getElementById("file_input_field").click()
}
document.getElementById("file_input_field").onchange = function(evt){
	// Start uploading the files async
	window.setTimeout(handleUploads(evt.target.files), 1)

	// This resets the file input field
	document.getElementById("file_input_field").nodeValue = ""
}

document.getElementById("upload_text_button").onclick = function() {
	window.location.href = '/t/'
}

/*
 * Drag 'n Drop upload handlers
 */

document.ondragover  = function(e) {
	e.preventDefault()
	e.stopPropagation()
}
document.ondragenter = function(e) {
	e.preventDefault()
	e.stopPropagation()
}
document.addEventListener('drop', function(e){
	if (e.dataTransfer && e.dataTransfer.files.length > 0) {
		e.preventDefault()
		e.stopPropagation()

		// Run async to not freeze the page
		window.setTimeout(handleUploads(e.dataTransfer.files), 1)
	}
})

/*
 * Share buttons
 */

document.getElementById("btn_social_share").addEventListener("click", function() {
	window.navigator.share({
		title: "Pixeldrain",
		text: shareTitle,
		url: shareLink
	})
})
document.getElementById("btn_copy_link").addEventListener("click", function() {
	copyLink()
})
document.getElementById("btn_open_link").addEventListener("click", function() {
	window.open(shareLink, '_blank')
})
document.getElementById("btn_social_email").addEventListener("click", function() {
	window.open('mailto:please@set.address?subject=File%20on%20pixeldrain&body=' + shareLink)
})
document.getElementById("btn_social_twitter").addEventListener("click", function() {
	window.open('https://twitter.com/share?url=' + shareLink)
})
document.getElementById("btn_social_facebook").addEventListener("click", function() {
	window.open('http://www.facebook.com/sharer.php?u=' + shareLink)
})
document.getElementById("btn_social_reddit").addEventListener("click", function() {
	window.open('https://www.reddit.com/submit?url=' + shareLink)
})
document.getElementById("btc_social_tumblr").addEventListener("click", function() {
	window.open('http://www.tumblr.com/share/link?url=' + shareLink)
})

/*
 * Link copy buttons
 */

function renderListButton(apiURL, id, title, subtitle) {
	let btn                = document.createElement("a")
	btn.classList          = "file_button"
	btn.href               = "/l/"+id
	btn.target             = "_blank"
	let thumbnail          = document.createElement("img")
	thumbnail.src          = apiURL+"/list/"+id+"/thumbnail?width=80&height=80"
	thumbnail.alt          = title
	let titleSpan          = document.createElement("span")
	titleSpan.classList    = "file_button_title"
	titleSpan.innerText    = title
	let br                 = document.createElement("br")
	let subtitleSpan       = document.createElement("span")
	subtitleSpan.classList = "file_button_subtitle"
	subtitleSpan.innerText = subtitle

	btn.appendChild(thumbnail)
	btn.appendChild(titleSpan)
	btn.appendChild(br)
	btn.appendChild(subtitleSpan)
	return btn
}

// Create list button
document.getElementById("btn_create_list").addEventListener("click", function(evt) {
	let title = prompt(
		"You are creating a list containing " + uploader.finishedUploads().length + " files.\n"
		+ "What do you want to call it?", "My New Album"
	)
	if(title === null){
		return
	}
	createList(title, false).then(resp => {
		document.getElementById("created_lists").appendChild(
			renderListButton(
				apiEndpoint,
				resp.id,
				domainURL()+'/l/'+resp.id,
				"List creation finished!",
			)
		)
		window.open('/l/'+resp.id, '_blank')
	}).catch(err => {
		let div = document.createElement("div")
		div.className = "file_button"
		div.innerHTML = "List creation failed<br/>"
			+ "The server responded with:<br/>"
			+ err
		document.getElementById("created_lists").append(div)
	})
})

let btnCopyLinks = document.getElementById("btn_copy_links")
btnCopyLinks.addEventListener("click", function(){
	let text = ""
	let uploads = uploader.finishedUploads()

	// Add the text to the textarea
	for (let i = 0; i < uploads.length; i++) {
		// Example: https://pixeldrain.com/u/abcd1234: Some_file.png
		text += domainURL()+"/u/"+uploads[i].fileID+" "+uploads[i].fileName+"\n"
	}
	if (shareLink.includes("/l/")) {
		text += "\n"+shareLink+" All "+uploads.length+" files\n"
	}

	// Copy the selected text
	if(copyText(text)){
		btnCopyLinks.classList.add("button_highlight")
		btnCopyLinks.innerHTML = "Links copied to clipboard!"
	}else{
		btnCopyLinks.classList.add("button_red")
		btnCopyLinks.innerHTML = "Copying links failed"
	}
})

let btnCopyBBCode = document.getElementById("btn_copy_bbcode")
btnCopyBBCode.addEventListener("click", function(){
	let text = ""
	let uploads = uploader.finishedUploads()

	// Add the text to the textarea
	for (let i = 0; i < uploads.length; i++) {
		// Example: [url=https://pixeldrain.com/u/abcd1234]Some_file.png[/url]
		text += "[url="+domainURL()+"/u/"+uploads[i].fileID+"]"+uploads[i].fileName+"[/url]\n"
	}
	if (shareLink.includes("/l/")) {
		text += "\n[url="+shareLink+"]All "+uploads.length+" files[/url]\n"
	}

	// Copy the selected text
	if(copyText(text)){
		btnCopyBBCode.classList.add("button_highlight")
		btnCopyBBCode.innerHTML = "BBCode copied to clipboard!"
	}else{
		btnCopyBBCode.classList.add("button_red")
		btnCopyBBCode.innerHTML = "Copying links failed"
	}
})

let btnCopyMarkdown = document.getElementById("btn_copy_markdown")
btnCopyMarkdown.addEventListener("click", function(){
	let text = ""
	let uploads = uploader.finishedUploads()

	// Add the text to the textarea
	for (let i = 0; i < uploads.length; i++) {
		// Example: * [Some_file.png](https://pixeldrain.com/u/abcd1234)

		if (uploads.length > 1) { text += " * " }
		text += "["+uploads[i].fileName+"]("+domainURL()+"/u/"+uploads[i].fileID+")\n"
	}
	if (shareLink.includes("/l/")) {
		text += " * [All "+uploads.length+" files]("+shareLink+")\n"
	}

	// Copy the selected text
	if(copyText(text)){
		btnCopyMarkdown.classList.add("button_highlight")
		btnCopyMarkdown.innerHTML = "Markdown copied to clipboard!"
	}else{
		btnCopyMarkdown.classList.add("button_red")
		btnCopyMarkdown.innerHTML = "Copying links failed"
	}
})


/*
 * Keyboard shortcuts
 */
document.addEventListener("keydown", function(event){
	if (event.ctrlKey || event.altKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}
	if (event.keyCode === 67) { // c
		// Copy links to clipboard
		document.getElementById("btn_copy_link").click()
	} else if (event.keyCode === 85) { // u
		// Click the upload button
		document.getElementById("file_input_field").click()
	} else if (event.keyCode === 84) { // t
		// Click the text button
		document.getElementById("upload_text_button").click()
	}
	console.log(event.keyCode)
})

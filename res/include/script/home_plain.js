// Form upload handlers

// Relay click event to hidden file field
document.getElementById("select_file_button").onclick = function(){
	document.getElementById("file_input_field").click()
}

document.getElementById("file_input_field").onchange = function(evt){
	handleUploads(evt.target.files);

	// This resets the file input field
	document.getElementById("file_input_field").nodeValue = "";
}

/*
 * Drag 'n Drop upload handlers
 */
document.ondragover = function (e) {
	e.preventDefault()
	e.stopPropagation()
}
document.ondragenter = function (e) {
	e.preventDefault()
	e.stopPropagation()
}

document.addEventListener('drop', function(e){
	if (e.dataTransfer && e.dataTransfer.files.length > 0) {
		e.preventDefault()
		e.stopPropagation()

		handleUploads(e.dataTransfer.files)
	}
})

function handleUploads(files) {
	if (uploader === null){
		uploader = new UploadManager();
		uploader.finishCallback = uploadsFinished;
	}

	for (var i = 0; i < files.length; i++) {
		uploader.uploadFile(new UploadProgressBar(files.item(i)))
	}

	document.getElementById("instruction_2").style.display = "";
	document.getElementById("instruction_3").style.display = "none";
	document.getElementById("instruction_3_after").style.display = "none";
}

var shareLink = "";
var shareTitle = "";

async function uploadsFinished() {
	let url = window.location.protocol+"//"+window.location.hostname;
	if (window.location.port != "") {
		url = window.location.protocol+"//"+window.location.hostname+":"+window.location.port;
	}

	if (finishedUploads.length === 0) {
		return;
	} else if (finishedUploads.length === 1) {
		shareLink = url+"/u/"+finishedUploads[0].id;
		shareTitle = "Download "+finishedUploads[0].name+" here";
	} else {
		let id = await createList(totalUploads+" files", true);
		console.log("Automatic list ID "+id);

		if (id != "") {
			shareLink = url+"/l/"+id;
			shareTitle = "View "+totalUploads+" files here";
		} else {
			alert("Failed to group files. Please create list manually");
		}
	}

	document.getElementById("instruction_3").style.display = "";
	document.getElementById("instruction_3_after").style.display = "";

	if (window.navigator && window.navigator.share) {
		document.getElementById("social_buttons").style.display = "none";
	} else {
		document.getElementById("navigator_share_button").style.display = "none";
	}
}

function shareButton() {
	window.navigator.share({
		title: "Pixeldrain",
		text: shareTitle,
		url: shareLink
	});
}

function copyLink() {
	if(copyText(shareLink)) {
		console.log('Text copied');
		document.querySelector("#btn_copy_link>span").textContent = "Copied!";
		document.getElementById("btn_copy_link").classList.add("button_highlight");
	} else {
		console.log('Copying not supported');
		alert("Your browser does not support copying text.");
	}
}

function openLink() {
	window.open(shareLink, '_blank');
}

function createList(title, anonymous) {
	var postData = {
		"title": title,
		"anonymous": anonymous,
		"files": new Array()
	};
	for (var i = 0; i < finishedUploads.length; i++) {
		if (finishedUploads[i] == undefined) {
			continue
		}
		postData.files.push({
			"id": finishedUploads[i].id
		});
	}

	return fetch(
		apiEndpoint+"/list",
		{
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(postData)
		}
	).then(response => {
		if (!response.ok) {
			throw new Error("HTTP error "+response.status);
		}
		return response.json();
	}).then(function (response) {
		return response.id;
	}).catch(function(error) {
		console.log(error);
	});
}

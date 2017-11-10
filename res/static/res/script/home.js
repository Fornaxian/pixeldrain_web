/* 
 * Made by Fornax for PixelDrain
 * Use if you want
 * 
 * I'll clean up this baby some time in the future too
 */

/*
 * Form upload handlers
 */


/* global API_URL */

$("#selectFileButton").click(function(event){
	$("#fileInputField").click();
});

$("#fileInputField").change(function(){
	pushUploads($("#fileInputField")[0].files);
	
	// This resets the file input field
	// http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
	$('#fileName').html("");
	$("#fileUploadButton").css("visibility", "hidden");
	$("#fileInputField").wrap("<form>").closest("form").get(0).reset();
	$("#fileInputField").unwrap();
});

/*
 * Drag 'n Drop upload handlers
 */
$(document).on('dragover', function (e) {
	e.preventDefault();
	e.stopPropagation();
});
$(document).on('dragenter', function (e) {
	e.preventDefault();
	e.stopPropagation();
});
$(document).on('drop', function (e) {
	if (e.originalEvent.dataTransfer) {
		var len = e.originalEvent.dataTransfer.files.length;
		
		if (len) {
			e.preventDefault();
			e.stopPropagation();
			
			pushUploads(e.originalEvent.dataTransfer.files);
		}
	}
});

/*
 * Upload functions
 */
function pushUploads(array){
	var len = array.length;
	
	for(i = 0; i < len; i++){
		uploadQueue.push(array[i]);
	}

	startFileUpload();
}

var isFirstUpload = true;
var uploadQueue = new Array();
var isUploading = false;

function startFileUpload() {
	if(isUploading){
		return;
	}
	var file = uploadQueue.shift();
	
	if(file === null){
		return;
	}
	
	if(isFirstUpload){
		isFirstUpload = false;
		$("#uploads-completed").animate(
			{"height": "340px"},
			{"duration": 2000, queue: false}
		);
		$("#progress-bar").animate(
			{"height": "20px"},
			{"duration": 1000, queue: false}
		);
	}
	
	isUploading = true;
	formData = new FormData();
	formData.append('file', file);
	formData.append("name", file.name);

	jQuery.ajax({
		url: API_URL + "/file",
		data: formData,
		cache: false,
		crossDomain: false,
		contentType: false,
		processData: false,
		type: 'POST',
		xhr: function () {
			var xhr = new window.XMLHttpRequest();
			xhr.upload.addEventListener("progress", function (evt) {
				if (evt.lengthComputable) {
					percentComplete = (evt.loaded / evt.total) * 100;
					
					$("#upload-progress").animate(
						{"width": percentComplete + "%"},
						{"duration": 200, queue: false}
					);
					
					$(".progress-text").html("Uploading... "
						+ evt.loaded + " / " + evt.total + " Bytes "
						+ "(" + uploadQueue.length + " files in queue)"
					);
				}
			}, false);

			return xhr;
		},
		success: function (data) {
			isUploading = false;
			if(uploadQueue.length > 0){
				startFileUpload();
			}else{
				$(".progress-text").html("Done! File link is available below");
			}
			
			fileUploadComplete(data);
		},
		error: function (xhr, status, error){
			console.log(status);
			console.log(error);
		}
	});
}

function fileUploadComplete(json) {
	if (json.success) {
		setHistoryCookie(json.id)

		resultString = "<div class=\"uploadItem\">Upload successful!<br/>"
			+ "Your file URL:<br/>"
			+ "<a href=\"/u/"+json.id+"\" target=\"_blank\">"+window.location.hostname+"/u/"+json.id+"</a>"
			+ "</div>";
		
		$('#uploads-completed').prepend(
			$(resultString).hide().fadeIn('slow')
		);
	
		addToList(json.id, "");
	} else {
		resultString = "<div class=\"uploadItem\">Something went wrong! "
			+ "The server responded with this:<br/>\"" + json.message
			+ "\"</div>";

		$('#uploads-completed').prepend(
			$(resultString).hide().fadeIn('slow')
		);
	
		$(".progressText").html(json.message);
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

$("#btnClearHistory").click(function(){
	$('#uploads-container').html("");
	listItems = new Array();
});
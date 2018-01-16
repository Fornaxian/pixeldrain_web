
var uploader: UploadManager|null = null;

/*
 * Form upload handlers
 */

$("#selectFileButton").click(function(event){
	$("#fileInputField").click();
});

function fileInputChange(dom: HTMLInputElement, files: FileList) {
	if (uploader === null){
		uploader = new UploadManager()
	}
	
	uploader.uploadFileList(files);
	
	// This resets the file input field
	// http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
	$('#fileName').html("");
	$("#fileUploadButton").css("visibility", "hidden");
	(<HTMLFormElement>$("#fileInputField").wrap("<form>").closest("form").get(0)).reset();
	$("#fileInputField").unwrap();
}

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
document.addEventListener('drop', function(e: DragEvent){
	if (e.dataTransfer && e.dataTransfer.files.length > 0) {
		e.preventDefault();
		e.stopPropagation();

		if (uploader === null){
			uploader = new UploadManager()
		}
		
		uploader.uploadFileList(e.dataTransfer.files);
	}
})

/*
 * Upload functions
 */
// function pushUploads(array){
// 	var len = array.length;
	
// 	for(i = 0; i < len; i++){
// 		uploadQueue.push(array[i]);
// 	}

// 	startFileUpload();
// }
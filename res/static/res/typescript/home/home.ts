

/*
 * Form upload handlers
 */

$("#selectFileButton").click(function(event){
	$("#fileInputField").click();
});

$("#fileInputField").on('change', null, (e) => {
	let field = <FileList> e.target
	
	//pushUploads($("#fileInputField")[0].files);
	
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
// $(document).on('drop', function (e) {
// 	if (e.originalEvent.dataTransfer) {
// 		var len = e.originalEvent.dataTransfer.files.length;
		
// 		if (len) {
// 			e.preventDefault();
// 			e.stopPropagation();
			
// 			pushUploads(e.originalEvent.dataTransfer.files);
// 		}
// 	}
// });

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
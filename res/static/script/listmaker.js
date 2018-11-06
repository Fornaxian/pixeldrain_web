$("#btn_create_list").click(function (evt) {
	createList();
});

function createList(){
	let listfiles = new Array()
	for (var i = 0; i < finishedUploads.length; i++) {
		if (finishedUploads[i] === undefined) {
			continue;
		}
		listfiles.push(finishedUploads[i]);
	}

	var url = "/api/list";

	var postData = {};

	var title = prompt(
		"You are creating a list containing " + listfiles.length + " files.\n"
		+ "What do you want to call it?", "My New Album"
	);

	if(title === null){
		return;
	}

	var postData = {
		"title": title,
		"description": "yo",
		"files": new Array()
	};

	for (var i = 0; i < listfiles.length; i++) {
		postData.files.push({
			"id": listfiles[i]
		});
	}

	$.ajax({
		url: url,
		contentType: "application/json",
		method: "POST",
		data: JSON.stringify(postData),
		dataType: "json",
		success: listCreated,
		error: listCreated
	});
}

function listCreated(response){
	if(response.success){
		resultString = "<div class=\"file_button\">List creation finished!<br/>"
			+ "Your List URL: <br/>"
			+ "<a href=\"/l/" + response.id + "\" target=\"_blank\" style=\"font-weight: bold;\">"+window.location.hostname+"/l/" + response.id + "</a>"
			+ "</div>";

		$('#uploads_queue').prepend(
			$(resultString).hide().fadeIn('slow').css("display", "")
		);
		window.open('/l/'+response.id, '_blank');
	}else{
		resultString = "<div class=\"file_button\">List creation failed<br/>"
			+ "The server responded with this: <br/>"
			+ response.type + ": " + response.value
			+ "</div>";

		$('#uploads_queue').prepend(
			$(resultString).hide().fadeIn('slow').css("display", "")
		);
	}
}
//$("#btnAddToList").click(function (evt) {
//	var fileId = $("#txtListId").val();
//	var fileDesc = $("#txtListDesc").val();
//
//	addToList(fileId, fileDesc);
//
//	divItems.prepend("ID: " + fileId + "<br>Description:<br>" + fileDesc + "<br><br>");
//
//	$("#txtListId").val("");
//	$("#txtListDesc").val("");
//});

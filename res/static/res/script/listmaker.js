
var listItems = new Array();

$("#btnCreateList").click(function (evt) {
	createList();
});

function addToList(id, desc){
	var listEntry = {id: id, desc: desc};

	listItems.push(listEntry);
}

function createList(){
	var url = "/api/list";
	
	var postData = {};
	
	var title = prompt(
		"You are creating a list containing " + listItems.length + " files.\n"
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
	
	var arrayLength = listItems.length;
	for (var i = 0; i < arrayLength; i++) {
		postData.files[i] = {
			"id": listItems[i]["id"],
			"description": listItems[i]["desc"]
		};
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
		resultString = "<div class=\"uploadItem\">List creation finished!<br/>"
			+ "Your List URL: <br/>"
			+ "<a href=\"/l/" + response.id + "\" target=\"_blank\" style=\"font-weight: bold;\">"+window.location.hostname+"/l/" + response.id + "</a>"
			+ "</div>";
		
		$('#uploads-completed').prepend(
			$(resultString).hide().fadeIn('slow')
		);
	}else{
		resultString = "<div class=\"uploadItem\">List creation failed<br/>"
			+ "The server responded with this: <br/>"
			+ response.type + ": " + response.value
			+ "</div>";
		
		$('#uploads-completed').prepend(
			$(resultString).hide().fadeIn('slow')
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
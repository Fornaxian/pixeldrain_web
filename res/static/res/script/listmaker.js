
var listItems = new Array();

function addToList(id, desc){
	var listEntry = {id: id, desc: desc};

	listItems.push(listEntry);
}

function createList(){
	var url = "/api/createlist/";
	
	var postData = {};
	
	var title = prompt(
		"You are creating a list containing " + listItems.length + " files.\n"
		+ "What do you want to call it?", "My New Album"
	);

	if(title === null){
		return;
	}
	
	postData["title" ] = title;
	
	var arrayLength = listItems.length;
	for (var i = 0; i < arrayLength; i++) {
		postData["id" + i] = listItems[i]["id"];
		postData["desc" + i] = listItems[i]["desc"];
	}
	
	$.post(url, postData, function(response){
		listCreated(response);
	});
}

function listCreated(response){
	if(response.status === "success"){
		resultString = "<div class=\"uploadHistory\">List creation finished!<br/>"
			+ "Your List URL: <br/>"
			+ "<a href=\"" + response.url + "\" target=\"_blank\" style=\"font-weight: bold;\">" + response.url + "</a>"
			+ "</div>";
		
		$('#uploads-container').prepend(
			$(resultString).hide().fadeIn('slow')
		);
	}else{
		resultString = "<div class=\"uploadHistory\">List creation failed<br/>"
			+ "The server responded with this: <br/>"
			+ response.type + ": " + response.value
			+ "</div>";
		
		$('#uploads-container').prepend(
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

$("#btnListCreate").click(function (evt) {
	createList();
});
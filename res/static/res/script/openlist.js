var listItems = new Array();

function addToList(id, desc){
	var listEntry = {id: id, desc: desc};

	listItems.push(listEntry);
}

function openList(){
    var arrayLength = listItems.length;
    
    var url = "/u/"
	for (var i = 0; i < arrayLength; i++) {
        if (i != 0) {
            url = url + ","
        }
        url = url + listItems[i]["id"]
    }
    
    window.open(url)
}

$("#btnOpenAsList").click(function (evt) {
	openList();
});
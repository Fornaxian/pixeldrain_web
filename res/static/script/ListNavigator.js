/* global Viewer */

var ListNavigator = {
	length: 0,
	position: 0,
	data: [],
	history: [],
	shuffle: false,

	nextItem: function(){
		if(!Viewer.isList){
			return;
		}
		if(this.shuffle){
			this.randItem();
			return;
		}

		if(this.position >= this.length){
			this.position = 0;
		}else{
			this.position++;
		}

		this.setItem(this.position);
	},

	previousItem: function(){
		if(!Viewer.isList){
			return;
		}

		if(this.position === 0){
			this.position = this.length - 1;
		}else{
			this.position--;
		}

		this.setItem(this.position);
	},

	randItem: function(){
		if(!Viewer.isList){
			return;
		}

		// Avoid viewing the same file multiple times
		var rand;
		do {
			rand = Math.round(Math.random() * this.length);
			console.log("rand is " + rand);
		} while(this.inHistory(rand));

		this.setItem(rand);
	},

	setItem: function(index){
		if(index >= this.length){
			this.position = 0;
		}else{
			this.position = index;
		}

		// Set the URL hash
		location.hash = "item=" + this.position;
		Viewer.setFile(this.data[this.position]);

		this.addToHistory(index);

		$("#listNavigatorItems").find("*").css("border-color", "#333");
		$("#listNavigatorItems div").eq(this.position).css("border-color", "#fff");

		// This centers the scroll bar exactly on the selected item
		$("#listNavigatorItems").animate(
			{
				scrollLeft: (this.position * 109) - (($("#listNavigatorItems").width() / 2) - 55)
			}, {
				duration: 1000,
				queue: false
			}
		);

		this.loadThumbnails(index);
	},

	addToHistory: function(index){
		if(this.history.length >= (this.length - 6)){
			this.history.shift();
		}

		this.history.push(index);
	},

	inHistory: function(index){
		var i = $.inArray(index, this.history); // Returns -1 when the item is not found

		return (i !== -1); // Return false when it's not in the array
	},

	toggleShuffle: function(){
		this.shuffle = !this.shuffle; // :P

		if(this.shuffle){
			$("#btnShuffle > span").html("&nbsp;Shuffle&nbsp;&#x2611;"); // Check icon
			$("#btnShuffle").addClass("button_highlight");
		}else{
			$("#btnShuffle > span").html("&nbsp;Shuffle&nbsp;&#x2610;"); // Empty checkbox
			$("#btnShuffle").removeClass("button_highlight");
		}
	},

	loadThumbnails: function(index){
		var startPos = +index - 30;
		var endPos = +index + 30;
		// fyi, the + is to let javascript know it's actually a number instead of a string

		if(startPos < 0){
			startPos = 0;
		}

		if(endPos >= this.length){
			endPos = this.length - 1;
		}
		console.log(endPos);

		var navigatorItems = document.getElementById("listNavigatorItems").children

		for (i = startPos; i <= endPos; i++){
			var thumb = "/api/file/" + this.data[i].id + "/thumbnail";
			var name = this.data[i].name;

			var itemHtml = escapeHTML(name) + "<br>"
				+ "<img src=\"" + thumb + "\" "
				+ "class=\"listItemThumbnail lazy\" alt=\"" + escapeHTML(name) + "\"/>";

			navigatorItems[i].innerHTML = itemHtml;
		}
	},

	init: function(data){
		var hashPos = getHashValue("item");
		this.data = data;
		this.length = data.length;

		var listHTML = "";
		data.forEach(function(item, i){
			var filename;
			if(item.name !== "null"){
				filename = item.name;
			}else{
				filename = "Removed File";
			}

			listHTML += "<div class=\"listItem\" "
				+ "onClick=\"ListNavigator.setItem('" + i + "')\">"
				+ escapeHTML(filename) + "<br>"
				+ "</div>";
		});
		document.getElementById("listNavigatorItems").innerHTML = listHTML;

		// Skip to this file if the parameter is set
		if(Number.isInteger(parseInt(hashPos))){
			this.setItem(hashPos);
		}else{
			this.setItem(0);
		}

		// Add the list download button to the toolbar
		var btnDownloadList = document.createElement("button");
		btnDownloadList.setAttribute("id", "btnDownloadList");
		btnDownloadList.setAttribute("class", "toolbar_button button_full_width");
		btnDownloadList.setAttribute("onClick", "Toolbar.downloadList();");

		var btnDownloadListImg = document.createElement("img");
		btnDownloadListImg.setAttribute("src", "/res/img/floppy_small.png");
		btnDownloadListImg.setAttribute("alt", "Download List");

		var btnDownloadListText = document.createElement("span");
		btnDownloadListText.innerHTML = "&nbsp;All Files";

		btnDownloadList.appendChild(btnDownloadListImg);
		btnDownloadList.appendChild(btnDownloadListText);
		document.getElementById("btnDownload").after(btnDownloadList);

		// Add the shuffle button to the toolbar
		var btnShuffle = document.createElement("button");
		btnShuffle.setAttribute("id", "btnShuffle");
		btnShuffle.setAttribute("class", "toolbar_button button_full_width");
		btnShuffle.setAttribute("onClick", "ListNavigator.toggleShuffle();");

		var btnShuffleImg = document.createElement("img");
		btnShuffleImg.setAttribute("src", "/res/img/shuffle_small.png");
		btnShuffleImg.setAttribute("alt", "Shuffle playback order");

		var btnShuffleText = document.createElement("span");
		btnShuffleText.innerHTML = "&nbsp;Shuffle&nbsp;&#x2610;";

		btnShuffle.appendChild(btnShuffleImg);
		btnShuffle.appendChild(btnShuffleText);
		document.getElementById("btnShare").after(btnShuffle);

		// We need to adjust the height of some elements to make the navigation bar fit
		var navHeight = $("#listNavigator").height() + 2;

		window.setTimeout(function(){
			document.getElementById("listNavigator").style.top         = "0px";
			document.getElementById("filepreview").style.top           = navHeight+"px";
			document.getElementById("toolbar").style.top               = navHeight+"px";
			document.getElementById("button-expand-toolbar").style.top = navHeight+"px";
			document.getElementById("sharebar").style.top              = navHeight+"px";
			document.getElementById("info_popup").style.top            = (navHeight+20)+"px";
		}, 200);
	}
};


// Misc function, don't really know where else to put it
function getHashValue(key) {
	var matches = location.hash.match(new RegExp(key + '=([^&]*)'));
	return matches ? matches[1] : null;
}

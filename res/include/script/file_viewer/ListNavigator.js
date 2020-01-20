class ListNavigator {
	viewer   = null;
	length   = 0;
	position = 0;
	data     = [];
	history  = [];
	shuffle  = false;

	divListNavigator = null;
	btnDownloadList  = null;
	btnShuffle       = null;

	constructor(viewer, data){let ln = this;
		ln.viewer = viewer;
		ln.data   = data;
		ln.length = data.length;

		ln.divListNavigator = document.getElementById("list_navigator");

		ln.btnDownloadList = document.getElementById("btn_download_list");
		ln.btnDownloadList.style.display = "";
		ln.btnDownloadList.addEventListener("click", () => { ln.downloadList(); });

		ln.btnShuffle = document.getElementById("btn_shuffle");
		ln.btnShuffle.style.display = "";
		ln.btnShuffle.addEventListener("click", () => { ln.toggleShuffle(); });

		// Render list contents in list navigator div
		data.forEach((item, i) => {
			let filename;
			if(item.name !== "null"){
				filename = item.name;
			}else{
				filename = "Removed File";
			}

			let d = document.createElement("div");
			d.classList = "file_button list_item";
			d.addEventListener("click", () => { ln.setItem(i); });
			d.innerText = filename;
			ln.divListNavigator.appendChild(d);
		});

		// Make the navigator visible
		ln.divListNavigator.style.display = "inline-block";

		// Skip to the file defined in the link hash
		if(Number.isInteger(parseInt(getHashValue("item")))){
			ln.setItem(parseInt(getHashValue("item")));
		}else{
			ln.setItem(0);
		}
	}

	nextItem(){let ln = this;
		if(ln.shuffle){
			ln.randItem();
			return;
		}

		if (ln.position >= ln.length) {
			ln.position = 0;
		} else {
			ln.position++;
		}

		ln.setItem(ln.position);
	}

	previousItem(){let ln = this;
		if(ln.position === 0){
			ln.position = ln.length - 1;
		}else{
			ln.position--;
		}

		ln.setItem(ln.position);
	}

	randItem(){let ln = this;
		// Avoid viewing the same file multiple times
		let rand;
		do {
			rand = Math.round(Math.random() * ln.length);
			console.log("rand is " + rand);
		} while(ln.history.indexOf(index) > -1);

		ln.setItem(rand);
	}

	setItem(index){let ln = this;
		if(index >= ln.length){
			ln.position = 0;
		}else{
			ln.position = index;
		}

		// Set the URL hash
		location.hash = "item=" + ln.position;
		ln.viewer.setFile(ln.data[ln.position]);

		ln.addToHistory(index);
		ln.loadThumbnails(index);

		document.querySelectorAll("#list_navigator > .file_button_selected").forEach(el => {
			el.classList.remove("file_button_selected");
		});

		let selectedItem = ln.divListNavigator.children[ln.position];
		selectedItem.classList.add("file_button_selected");

		let cst = window.getComputedStyle(selectedItem);
		let itemWidth = selectedItem.offsetWidth + parseInt(cst.marginLeft) + parseInt(cst.marginRight);

		let start = ln.divListNavigator.scrollLeft;
		let end = ((ln.position * itemWidth) + (itemWidth / 2)) - (ln.divListNavigator.clientWidth / 2);
		let steps = 60; // One second
		let stepSize = (end - start)/steps;

		let animateScroll = (pos, step) => {
			ln.divListNavigator.scrollLeft = pos;

			if (step < steps) {
				requestAnimationFrame(() => {
					animateScroll(pos+stepSize, step+1);
				});
			}
		};
		animateScroll(start, 0);
	}

	downloadList(){let ln = this;
		document.getElementById("download_frame").src = "/api/list/" + ln.viewer.listId + "/zip";
	}

	addToHistory(index){let ln = this;
		if(ln.history.length >= (ln.length - 6)){
			ln.history.shift();
		}

		ln.history.push(index);
	}

	toggleShuffle(){let ln = this;
		ln.shuffle = !ln.shuffle; // :P

		if(ln.shuffle){
			document.querySelector("#btn_shuffle > span").innerHTML = "Shuffle&nbsp;&#x2611;"; // Check icon
			ln.btnShuffle.classList.add("button_highlight");
		}else{
			document.querySelector("#btn_shuffle > span").innerHTML = "Shuffle&nbsp;&#x2610;"; // Empty checkbox
			ln.btnShuffle.classList.remove("button_highlight");
		}
	}

	loadThumbnails(index){let ln = this;
		let startPos = +index - 50;
		let endPos   = +index + 50;
		// fyi, the + is to let javascript know it's actually a number instead of a string

		if(startPos < 0){
			startPos = 0;
		}

		if(endPos >= ln.length){
			endPos = ln.length - 1;
		}

		let navigatorItems = document.getElementById("list_navigator").children

		for (let i = startPos; i <= endPos; i++){
			if (navigatorItems[i].innerHTML.includes("list_item_thumbnail")) {
				continue; // Thumbnail already loaded
			}

			let thumb = "/api/file/" + ln.data[i].id + "/thumbnail?width=48&height=48";
			let name = ln.data[i].name;

			let itemHtml = "<img src=\"" + thumb + "\" "
				+ "class=\"list_item_thumbnail\" alt=\"" + escapeHTML(name) + "\"/>"
				+ escapeHTML(name);

			navigatorItems[i].innerHTML = itemHtml;
		}
	}
};


// Misc function, don't really know where else to put it
function getHashValue(key) {
	let matches = location.hash.match(new RegExp(key + '=([^&]*)'));
	return matches ? matches[1] : null;
}

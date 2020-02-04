function ListNavigator(viewer, files) {
	this.viewer   = viewer
	this.files    = files
	this.length   = files.length
	this.position = 0
	this.history  = []
	this.shuffle  = false

	this.divListNavigator = document.getElementById("list_navigator")

	this.btnDownloadList = document.getElementById("btn_download_list")
	if (files.id !== "") {
		this.btnDownloadList.style.display = ""
		this.btnDownloadList.addEventListener("click", () => { this.downloadList() })
	}
	this.btnShuffle = document.getElementById("btn_shuffle")
	this.btnShuffle.style.display = ""
	this.btnShuffle.addEventListener("click", () => { this.toggleShuffle() })

	// Render list contents in list navigator div
	files.forEach((item, i) => {
		let filename
		if(item.name !== "null"){
			filename = item.name
		}else{
			filename = "Removed File"
		}

		let d = document.createElement("div")
		d.classList = "file_button list_item"
		d.addEventListener("click", () => { this.setItem(i) })
		d.innerText = filename
		this.divListNavigator.appendChild(d)
	})

	// Make the navigator visible
	this.divListNavigator.style.display = "inline-block"

	// Skip to the file defined in the link hash
	let matches = location.hash.match(new RegExp('item=([^&]*)'))
	let hashID = matches ? matches[1] : null

	if(Number.isInteger(parseInt(hashID))){
		this.setItem(parseInt(hashID))
	}else{
		this.setItem(0)
	}
}

ListNavigator.prototype.nextItem = function() {
	if(this.shuffle){
		this.randItem()
		return
	}

	if (this.position >= this.length) {
		this.position = 0
	} else {
		this.position++
	}

	this.setItem(this.position)
}

ListNavigator.prototype.previousItem = function() {
	if(this.position === 0){
		this.position = this.length - 1
	}else{
		this.position--
	}

	this.setItem(this.position)
}

ListNavigator.prototype.randItem = function() {
	// Avoid viewing the same file multiple times
	let rand
	do {
		rand = Math.round(Math.random() * this.length)
		console.log("rand is " + rand)
	} while(this.history.indexOf(rand) > -1)

	this.setItem(rand)
}

ListNavigator.prototype.setItem = function(index) {
	if(index >= this.length){
		this.position = 0
	}else{
		this.position = index
	}

	// Set the URL hash
	location.hash = "item=" + this.position
	this.viewer.setFile(this.files[this.position])

	this.addToHistory(index)
	this.loadThumbnails(index)

	document.querySelectorAll("#list_navigator > .file_button_selected").forEach(el => {
		el.classList.remove("file_button_selected")
	})

	let selectedItem = this.divListNavigator.children[this.position]
	selectedItem.classList.add("file_button_selected")

	let cst = window.getComputedStyle(selectedItem)
	let itemWidth = selectedItem.offsetWidth + parseInt(cst.marginLeft) + parseInt(cst.marginRight)

	let start = this.divListNavigator.scrollLeft
	let end = ((this.position * itemWidth) + (itemWidth / 2)) - (this.divListNavigator.clientWidth / 2)
	let steps = 60 // One second
	let stepSize = (end - start)/steps

	let animateScroll = (pos, step) => {
		this.divListNavigator.scrollLeft = pos

		if (step < steps) {
			requestAnimationFrame(() => {
				animateScroll(pos+stepSize, step+1)
			})
		}
	}
	animateScroll(start, 0)
}

ListNavigator.prototype.downloadList = function() {
	document.getElementById("download_frame").src = "/api/list/" + this.viewer.listId + "/zip"
}

ListNavigator.prototype.addToHistory = function(index) {
	if(this.history.length >= (this.length - 6)){
		this.history.shift()
	}
	this.history.push(index)
}

ListNavigator.prototype.toggleShuffle = function() {
	this.shuffle = !this.shuffle // :P

	if(this.shuffle){
		document.querySelector("#btn_shuffle > span").innerHTML = "Shuffle&nbsp;&#x2611;" // Check icon
		this.btnShuffle.classList.add("button_highlight")
	}else{
		document.querySelector("#btn_shuffle > span").innerHTML = "Shuffle&nbsp;&#x2610;" // Empty checkbox
		this.btnShuffle.classList.remove("button_highlight")
	}
}

ListNavigator.prototype.loadThumbnails = function(index) {
	let startPos = +index - 50
	let endPos   = +index + 50
	// fyi, the + is to let javascript know it's actually a number instead of a string

	if(startPos < 0){
		startPos = 0
	}
	if(endPos >= this.length){
		endPos = this.length - 1
	}

	let navigatorItems = document.getElementById("list_navigator").children

	for (let i = startPos; i <= endPos; i++){
		if (navigatorItems[i].innerHTML.includes("list_item_thumbnail")) {
			continue // Thumbnail already loaded
		}

		let thumb = "/api/file/" + this.files[i].id + "/thumbnail?width=48&height=48"
		let name = this.files[i].name

		let itemHtml = "<img src=\"" + thumb + "\" "
			+ "class=\"list_item_thumbnail\" alt=\"" + escapeHTML(name) + "\"/>"
			+ escapeHTML(name)

		navigatorItems[i].innerHTML = itemHtml
	}
}

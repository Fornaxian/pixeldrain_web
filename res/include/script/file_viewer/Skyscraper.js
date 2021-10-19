function Skyscraper() {
	this.visible = false

	this.divSkyscraper = document.getElementById("skyscraper")
	this.divAdSpace = document.getElementById("skyscraper_ad_space")
	this.divFilePreview = document.getElementById("filepreview")
	this.btnClose = document.getElementById("btn_skyscraper_close")
	this.btnClose.addEventListener("click", () => { this.close() })
}

Skyscraper.prototype.open = function () {
	// If the ad popup was dismissed less than 24 hours ago we don't show it
	let dismissal = +localStorage.getItem("viewer_skyscraper_ad_dismissed")
	let now = new Date().getTime()

	if (dismissal > 0 && now - dismissal < 1000 * 60 * 60 * 24) {
		console.log("Skyscraper dismissed")
		return
	}

	if (skyscraperType === "a-ads") {
		let adsColours = "&background_color=" + window.style.layer2Color +
			"&text_color=" + window.style.textColor +
			"&title_color=" + window.style.highlightColor +
			"&title_hover_color=" + window.style.highlightColor +
			"&link_color=" + window.style.highlightColor +
			"&link_hover_color=" + window.style.highlightColor

		this.divAdSpace.innerHTML = `<iframe
				data-aa="1811738"
				src="//ad.a-ads.com/1811738?size=160x600${adsColours}"
				style="width:160px; height:600px; border:0px; padding:0; overflow:hidden; background-color: transparent;">
			</iframe>`
	} else if (skyscraperType === "pixfuture") {

		let div = document.createElement("div")
		div.id = "27513x160x600x4605x_ADSLOT1"
		div.setAttribute("clickTrack", "%%CLICK_URL_ESC%%")
		this.divAdSpace.appendChild(div)

		let script = document.createElement("script")
		script.async = "async"
		script.type = "text/javascript"
		script.src = "https:\/\/served-by.pixfuture.com/www/delivery/headerbid.js"
		script.setAttribute("slotId", "27513x160x600x4605x_ADSLOT1")
		script.setAttribute("refreshTime", "5")
		script.setAttribute("refreshInterval", "60")
		document.head.appendChild(script)

	} else {
		return
	}

	this.divSkyscraper.style.right = "0"
	this.divFilePreview.style.right = this.divSkyscraper.offsetWidth + "px"
	this.visible = true
}

Skyscraper.prototype.close = function () {
	this.divSkyscraper.style.right = -this.divSkyscraper.offsetWidth + "px"
	this.divFilePreview.style.right = "0"
	this.visible = false

	localStorage.setItem("viewer_skyscraper_ad_dismissed", new Date().getTime())

	// Remove the ad from the DOM to save memory
	setTimeout(() => { this.divSkyscraper.remove() }, 1000)
}

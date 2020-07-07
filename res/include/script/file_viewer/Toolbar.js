function Toolbar(viewer) {
	this.viewer           = viewer
	this.visible          = false
	this.sharebarVisible  = false
	this.currentFile      = null
	this.editWindow       = null

	this.views            = 0
	this.downloads        = 0
	this.statsInterval    = 2000
	this.statsTimeout     = null

	this.divToolbar       = document.getElementById("toolbar")
	this.divFilePreview   = document.getElementById("filepreview")
	this.downloadFrame    = document.getElementById("download_frame")
	this.spanViews        = document.getElementById("stat_views")
	this.spanDownloads    = document.getElementById("stat_downloads")
	this.spanSize         = document.getElementById("stat_size")

	this.btnToggleToolbar = document.getElementById("btn_toggle_toolbar")
	this.btnDownload      = document.getElementById("btn_download")
	this.btnCopyLink      = document.getElementById("btn_copy")
	this.spanCopyLink     = document.querySelector("#btn_copy > span")
	this.btnShare         = document.getElementById("btn_share")
	this.divSharebar      = document.getElementById("sharebar")

	this.btnToggleToolbar.addEventListener("click", () => { this.toggle() })
	this.btnDownload.addEventListener("click",      () => { this.download() })
	this.btnCopyLink.addEventListener("click",      () => { this.copyUrl() })
	this.btnShare.addEventListener("click",         () => { this.toggleSharebar() })
}

Toolbar.prototype.setFile = function(file) {
	this.currentFile = file
	this.spanSize.innerText = formatDataVolume(file.size, 3)

	this.setStats()
}

// This function periodically updates the stats using an exponential backoff
// timer. It starts with one query per second, and it increases by one second
// every run. When the stats change the timeout decreases by one second
Toolbar.prototype.setStats = function() {
	clearTimeout(this.statsTimeout)

	let size = this.currentFile.size

	fetch(this.currentFile.stats_href).then(resp => {
		return resp.json()
	}).then(resp => {
		let downloads = Math.round(resp.bandwidth/size)

		// If the new values are different we decrease the timeout
		if (resp.views != this.views || downloads != this.downloads) {
			this.statsInterval = this.statsInterval - 2000
			if (this.statsInterval < 2000) { this.statsInterval = 2000 }
		} else {
			this.statsInterval = this.statsInterval + 2000
		}

		// Save the new values
		this.views = resp.views
		this.downloads = downloads

		this.spanViews.innerText = formatThousands(this.views)
		this.spanDownloads.innerText = formatThousands(downloads)

		console.debug("updating stats in ", this.statsInterval)

		this.statsTimeout = setTimeout(() => { this.setStats() }, this.statsInterval)
	}).catch(err => {
		console.error("Failed to update stats:", err)
		this.statsTimeout = setTimeout(() => { this.setStats() }, this.statsInterval)
	})
}

Toolbar.prototype.toggle = function() {
	if (this.visible) {
		if (this.sharebarVisible) { this.toggleSharebar() }

		this.divToolbar.style.left = "-8em"
		this.divFilePreview.style.left = "0px"
		this.btnToggleToolbar.classList.remove("button_highlight")
		this.visible = false
	} else {
		this.divToolbar.style.left = "0px"
		this.divFilePreview.style.left = "8em"
		this.btnToggleToolbar.classList.add("button_highlight")
		this.visible = true
	}
}

Toolbar.prototype.toggleSharebar = function() {
	if (navigator.share) {
		navigator.share({
			title: this.viewer.title,
			text: "Download " + this.viewer.title + " here",
			url: window.location.href
		})
		return
	}

	if(this.sharebarVisible){
		this.divSharebar.style.left = "-8em"
		this.btnShare.classList.remove("button_highlight")
		this.sharebarVisible = false
	}else{
		this.divSharebar.style.left = "8em"
		this.btnShare.classList.add("button_highlight")
		this.sharebarVisible = true
	}
}

Toolbar.prototype.download = function() {
	if (captchaKey === "none" || captchaKey === ""){
		console.debug("Server doesn't support captcha, starting download")
		this.downloadFrame.src = this.currentFile.download_href
		return
	}

	if (this.currentFile.availability === "") {
		console.debug("File is available, starting download")
		this.downloadFrame.src = this.currentFile.download_href
	} else {
		console.debug("File is not readily available, showing captcha dialog")

		let showCaptcha = (title, text) => {
			// Create the modal
			this.captchaModal = new Modal(
				document.getElementById("file_viewer"),
				null, title, "500px", "auto",
			)

			// Clone the popup contents and insert them into the popup
			let clone = document.getElementById("tpl_captcha_popup").content.cloneNode(true)
			clone.querySelector(".captcha_text").innerText = text
			recaptchaElement = clone.querySelector(".captcha_popup_captcha")
			this.captchaModal.setBody(clone)

			// Set the callback function
			recaptchaCallback = token => {
				// Download the file using the recaptcha token
				this.downloadFrame.src = this.currentFile.download_href+"&recaptcha_response="+token
				this.captchaModal.close()
			}

			// Load the recaptcha script with a load function
			let script = document.createElement("script")
			script.src = "https://www.google.com/recaptcha/api.js?onload=loadCaptcha&render=explicit"
			document.body.appendChild(script)

			// Show the popup
			this.captchaModal.open()
		}

		console.log(this.currentFile.availability)
		if (this.currentFile.availability === "file_rate_limited_captcha_required") {
			console.debug("Showing rate limiting captcha")
			showCaptcha(
				"Rate limiting enabled!",
				"This file is using a suspicious amount of bandwidth relative "+
				"to its popularity. To continue downloading this file you "+
				"will have to prove that you're a human first.",
			)
		} else if (this.currentFile.availability === "virus_detected_captcha_required") {
			console.debug("Showing virus captcha")
			showCaptcha(
				"Malware warning!",
				"According to our scanning systems this file may contain a "+
				"virus of type '"+this.currentFile.availability_name+"'. You "+
				"can continue downloading this file at your own risk, but you "+
				"will have to prove that you're a human first.",
			)
		}
	}
}

Toolbar.prototype.copyUrl = function() {
	if(copyText(window.location.href)) {
		console.log('Text copied')
		this.spanCopyLink.innerText = "Copied!"
		this.btnCopyLink.classList.add("button_highlight")
	} else {
		console.log('Copying not supported')
		this.spanCopyLink.innerText = "Error!"
		alert("Your browser does not support copying text.")
	}

	// Return to normal
	setTimeout(() => {
		this.spanCopyLink.innerText = "Copy"
		this.btnCopyLink.classList.remove("button_highlight")
	}, 60000)
}

// Called by the google recaptcha script
let recaptchaElement  = null
let recaptchaCallback = null
function loadCaptcha(){
	grecaptcha.render(recaptchaElement, {
		sitekey: captchaKey,
		theme: "dark",
		callback: recaptchaCallback,
	})
}

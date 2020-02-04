function Toolbar(viewer) {
	this.viewer = viewer
	this.visible = false
	this.sharebarVisible = false
	this.currentFile = null

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
	this.spanViews.innerText = file.views
	this.spanDownloads.innerText = Math.round((file.bandwidth_used/file.size)*10)/10
	this.spanSize.innerText = formatDataVolume(file.size, 3)
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
	let triggerDL = (captchaResp = "") => {
		if (captchaResp === "") {
			this.downloadFrame.src = this.currentFile.download_href
		} else {
			this.downloadFrame.src = this.currentFile.download_href+"&recaptcha_response="+captchaResp
		}
	}

	if (captchaKey === "none" || captchaKey === ""){
		// If the server doesn't support captcha there's no use in checking
		// availability
		triggerDL()
		return
	}
	if (recaptchaResponse !== "") {
		// Captcha already filled in. Use the saved captcha responsse to
		// download the file
		triggerDL(recaptchaResponse)

		// Reset the key
		recaptchaResponse = ""
		return
	}

	fetch(this.currentFile.file_availability_href).then(resp => {
		return resp.json()
	}).then(resp => {
		let popupDiv = document.getElementById("captcha_popup")
		let popupTitle = document.getElementById("captcha_popup_title")
		let popupContent = document.getElementById("captcha_popup_content")

		let showCaptcha = () => {
			// Load the recaptcha script with a load function
			let script = document.createElement("script")
			script.src = "https://www.google.com/recaptcha/api.js?onload=loadCaptcha&render=explicit"
			document.body.appendChild(script)

			// Show the popup
			popupDiv.style.opacity = "1"
			popupDiv.style.visibility = "visible"
		}

		if (resp.value === "file_rate_limited_captcha_required") {
			popupTitle.innerText = "Rate limiting enabled!"
			popupContent.innerText = "This file is using a suspicious "+
				"amount of bandwidth relative to its popularity. To "+
				"continue downloading this file you will have to "+
				"prove that you're a human first."
			showCaptcha()
		} else if (resp.value === "virus_detected_captcha_required") {
			popupTitle.innerText = "Malware warning!"
			popupContent.innerText = "According to our scanning "+
				"systems this file may contain a virus  of type '"+
				resp.extra+"'. You can continue downloading this file at "+
				"your own risk, but you will have to prove that you're a "+
				"human first."
			showCaptcha()
		} else {
			console.warn("resp.value not valid: "+resp.value)
			triggerDL()
		}
	}).catch(e => {
		console.warn("fetch availability failed: "+e)
		triggerDL()
	})
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
let recaptchaResponse = ""
function loadCaptcha(){
	grecaptcha.render("captcha_popup_captcha", {
		sitekey: captchaKey,
		theme: "dark",
		callback: token => {
			recaptchaResponse = token
			document.getElementById("btn_download").click()

			// Hide the popup
			setTimeout(() => {
				let popupDiv = document.getElementById("captcha_popup")
				popupDiv.style.opacity = "0"
				popupDiv.style.visibility = "hidden"
			}, 1000)
		}
	})
}

class Toolbar {
	viewer = null;

	visible = false;
	sharebarVisible = false;

	// Elements
	divToolbar       = null;
	divFilePreview   = null;
	downloadFrame    = null

	spanViews        = null;
	spanDownloads    = null;

	btnToggleToolbar = null;
	btnDownload      = null;
	btnCopyLink      = null;
	spanCopyLink     = null;
	btnShare         = null;
	divSharebar      = null;

	constructor(viewer) {let t = this;
		this.viewer = viewer;

		t.divToolbar       = document.getElementById("toolbar");
		t.divFilePreview   = document.getElementById("filepreview");
		t.downloadFrame    = document.getElementById("download_frame");
		t.spanViews        = document.getElementById("stat_views");
		t.spanDownloads    = document.getElementById("stat_downloads");

		t.btnToggleToolbar = document.getElementById("btn_toggle_toolbar");
		t.btnDownload      = document.getElementById("btn_download");
		t.btnCopyLink      = document.getElementById("btn_copy");
		t.spanCopyLink     = document.querySelector("#btn_copy > span");
		t.btnShare         = document.getElementById("btn_share");
		t.divSharebar      = document.getElementById("sharebar");

		t.btnToggleToolbar.addEventListener("click", () => { t.toggle(); });
		t.btnDownload.addEventListener("click", () => { t.download(); });
		t.btnCopyLink.addEventListener("click", () => { t.copyUrl(); });
		t.btnShare.addEventListener("click", () => { t.toggleSharebar(); });
	}

	toggle() {let t = this;
		if (t.visible) {
			if (t.sharebarVisible) { t.toggleSharebar(); }

			t.divToolbar.style.left = "-8em";
			t.divFilePreview.style.left = "0px";
			t.btnToggleToolbar.classList.remove("button_highlight");
			t.visible = false;
		} else {
			t.divToolbar.style.left = "0px";
			t.divFilePreview.style.left = "8em";
			t.btnToggleToolbar.classList.add("button_highlight");
			t.visible = true;
		}
	}

	toggleSharebar(){let t = this;
		if (navigator.share) {
			navigator.share({
				title: t.viewer.title,
				text: "Download " + t.viewer.title + " here",
				url: window.location.href
			});
			return;
		}

		if(t.sharebarVisible){
			t.divSharebar.style.left = "-8em";
			t.btnShare.classList.remove("button_highlight")
			t.sharebarVisible = false;
		}else{
			t.divSharebar.style.left = "8em";
			t.btnShare.classList.add("button_highlight")
			t.sharebarVisible = true;
		}
	}

	download() {let t = this;
		let triggerDL = function(){
			t.downloadFrame.src = apiEndpoint+"/file/"+t.viewer.currentFile+"?download";
		}

		if (captchaKey === "a"){
			// If the server doesn't support captcha there's no use in checking
			// availability
			triggerDL();
			return;
		}

		fetch(apiEndpoint+"/file/"+t.viewer.currentFile+"/availability").then(resp => {
			return resp.json();
		}).then(resp => {
			let popupDiv = document.getElementById("captcha_popup");
			let popupTitle = document.getElementById("captcha_popup_title");
			let popupContent = document.getElementById("captcha_popup_content");

			let showCaptcha = function() {
				// Load the recaptcha script with a load function
				var script = document.createElement("script");
				script.src = "https://www.google.com/recaptcha/api.js?onload=loadCaptcha&render=explicit";
				document.appendChild(script);
				// $.getScript("https://www.google.com/recaptcha/api.js?onload=loadCaptcha&render=explicit");
				popupDiv.style.opacity = "1";
				popupDiv.style.visibility = "visible";
			}

			if (resp.value === "file_rate_limited_captcha_required") {
				popupTitle.innerText = "Rate limiting enabled!";
				popupContent.innerText = "This file is using a suspicious "+
					"amount of bandwidth relative to its popularity. To "+
					"continue downloading this file you will have to "+
					"prove that you're a human first.";
				showCaptcha();
			} else if (resp.value === "virus_detected_captcha_required") {
				popupTitle.innerText = "Malware warning!";
				popupContent.innerText = "According to our scanning "+
					"systems this file may contain a virus  of type '"+
					resp.extra+"'. You can continue downloading this file at "+
					"your own risk, but you will have to prove that you're a "+
					"human first.";
				showCaptcha();
			} else {
				triggerDL();
			}
		}).catch(e => {
			triggerDL();
		});
	}

	copyUrl() {let t = this;
		if(copyText(window.location.href)) {
			console.log('Text copied');
			t.spanCopyLink.innerText = "Copied!";
			t.btnCopyLink.classList.add("button_highlight")
		} else {
			console.log('Copying not supported');
			t.spanCopyLink.innerText = "Error!";
			alert("Your browser does not support copying text.");
		}

		// Return to normal
		setTimeout(function(){
			t.spanCopyLink.innerText = "Copy";
			t.btnCopyLink.classList.remove("button_highlight")
		}, 60000);
	}

	setStats(views, downloads) {let t = this;
		t.spanViews.innerText = views
		t.spanDownloads.innerText = Math.round(downloads*10)/10;
	}
}

// Called by the google recaptcha script
function loadCaptcha(){
	grecaptcha.render("captcha_popup_captcha", {
		sitekey: captchaKey,
		theme: "dark",
		callback: function(token){
			document.getElementById("download_frame").src = "/api/file/" + Viewer.currentFile +
				"?download&recaptcha_response="+token;

			setTimeout(function(){
				let popupDiv = document.getElementById("captcha_popup");
				popupDiv.style.opacity = "0";
				popupDiv.style.visibility = "hidden";
			}, 1000)
		}
	});
}

function formatDataVolume(amt) {
	if (amt > 1e12) {
		return Math.round(amt/1e9)/1e3 + " TB";
	} else if (amt > 1e9) {
		return Math.round(amt/1e6)/1e3 + " GB";
	} else if (amt > 1e6) {
		return Math.round(amt/1e3)/1e3 + " MB";
	} else if (amt > 1e3) {
		return Math.round(amt)/1e3 + " kB";
	}
	return amt + " B"
}

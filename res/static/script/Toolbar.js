/*
 * Time for a more Java-like approach.
 *
 *  Feel free to use this of course
 *
 *  Made by Fornax
 */

/* global Viewer */

var Toolbar = {
	visible: true,
	toggle: function () {
		if (this.visible) {
			if (Sharebar.visible) {
				Sharebar.toggle();
			}

			document.getElementById("toolbar").style.left = "-132px";
			document.getElementById("filepreview").style.left = "0px";
			document.getElementById("info_popup").style.left = "20px";

			this.visible = false;
		} else {
			document.getElementById("toolbar").style.left = "0px";
			document.getElementById("filepreview").style.left = "122px";
			document.getElementById("info_popup").style.left = "142px";

			this.visible = true;
		}
	},
	download: function () {
		var triggerDL = function(){
			document.getElementById("download_frame").src = "/api/file/" + Viewer.currentFile + "?download";
		}

		if (captchaKey === "a"){
			// If the server doesn't support captcha there's no use in checking
			// availability
			triggerDL();
			return;
		}

		$.getJSON(
			apiEndpoint + "/file/" + Viewer.currentFile + "/availability"
		).done(function(data){
			if(data.success === true){
				// Downloading is allowed, start the download
				triggerDL();
			}
		}).fail(function(data){
			console.log(data);
			if(data.responseJSON.success === false) {
				var popupDiv = document.getElementById("captcha_popup");

				if(data.responseJSON.value === "file_rate_limited_captcha_required") {
					popupDiv.innerHTML = '<div class="highlight_light border_top border_bottom">Rate limiting enabled!</div>'+
						data.responseJSON.message;
				}else if(data.responseJSON.value === "virus_detected_captcha_required"){
					popupDiv.innerHTML = '<div class="highlight_light border_top border_bottom">Malware warning!</div>'+
						data.responseJSON.message+
						"<hr/>Malware type: " + data.responseJSON.extra;
				}

				popupDiv.style.opacity = "1";
				popupDiv.style.visibility = "visible";
			}else{
				// No JSON, try download anyway
				triggerDL();
			}
		});
	},
	downloadList: function(){
		if(!Viewer.isList){
			return;
		}
		document.getElementById("download_frame").src = "/api/list/" + Viewer.listId + "/zip";
	},
	copyUrl: function () {
		if(copyText(window.location.href)) {
			console.log('Text copied');
			$("#btnCopy>span").text("Copied!");
			document.getElementById("btnCopy").classList.add("button_highlight")
		} else {
			console.log('Copying not supported');
			$("#btnCopy>span").text("Error!");
			alert("Your browser does not support copying text.");
		}

		// Return to normal
		setTimeout(function(){
			$("#btnCopy>span").text("Copy");
			document.getElementById("btnCopy").classList.remove("button_highlight")
		}, 60000);
	},
	setStats: function(views, downloads){
		document.getElementById("stat_views").innerText = views
		document.getElementById("stat_downloads").innerText = Math.round(downloads*10)/10;
	}
};

var Sharebar = {
	visible: false,

	toggle: function(){
		if (!Toolbar.visible){
			Toolbar.toggle();
		}

		if(this.visible){
			document.getElementById("sharebar").style.left = "-112px";
			document.getElementById("btnShare").classList.remove("button_highlight")
			this.visible = false;
		}else{
			document.getElementById("sharebar").style.left = "120px";
			document.getElementById("btnShare").classList.add("button_highlight")
			this.visible = true;
		}
	}
};

function copyText(text) {
	// Create a textarea to copy the text from
	var ta = document.createElement("textarea");
	ta.setAttribute("readonly", "readonly")
	ta.style.position = "absolute";
	ta.style.left = "-9999px";
	ta.value = text; // Put the text in the textarea

	// Add the textarea to the DOM so it can be seleted by the user
	document.body.appendChild(ta);
	ta.select(); // Select the contents of the textarea
	var success = document.execCommand("copy"); // Copy the selected text
	document.body.removeChild(ta); // Remove the textarea
	return success;
}

var DetailsWindow = {
	visible:       false,
	popupDiv:      document.getElementById("info_popup"),
	detailsButton: document.getElementById("btnDetails"),
	toggle: function () {
		if (this.visible) {
			this.popupDiv.style.opacity = "0"
			this.popupDiv.style.visibility = "hidden"
			this.detailsButton.classList.remove("button_highlight")
			this.visible = false;
		} else {
			this.popupDiv.style.opacity = "1"
			this.popupDiv.style.visibility = "visible"
			this.detailsButton.classList.add("button_highlight")
			this.visible = true;
		}
	},
	setDetails: function (file) {
		if (Viewer.isList) {
			// Lists give incomplete file information, so we have to request
			// more details in the background. File descriptions only exist in
			// lists, so for that we use the data provided in the page source
			$.ajax({
				dataType: "json",
				url: apiEndpoint + "/file/" + file.id + "/info",
				success: function(data){
					$("#info_file_details").html(
						"<table>"
						+ "<tr><td>Name<td><td>" + escapeHTML(data.name) + "</td></tr>"
						+ "<tr><td>Url<td><td><a href=\"/u/" + data.id + "\">/u/" + data.id + "</a></td></tr>"
						+ "<tr><td>Mime Type<td><td>" + escapeHTML(data.mime_type) + "</td></tr>"
						+ "<tr><td>ID<td><td>" + data.id + "</td></tr>"
						+ "<tr><td>Size<td><td class=\"bytecounter\">" + data.size + "</td></tr>"
						+ "<tr><td>Bandwidth<td><td class=\"bytecounter\">" + data.bandwidth_used + "</td></tr>"
						+ "<tr><td>Upload Date<td><td>" + data.date_upload + "</td></tr>"
						+ "<tr><td>Description<td><td>" + escapeHTML(file.description) + "</td></tr>"
						+ "</table>"
					);
					Toolbar.setStats(data.views, data.bandwidth_used/data.size);
				}
			});
		} else {
			$("#info_file_details").html(
				"<table>"
				+ "<tr><td>Name<td><td>" + escapeHTML(file.name) + "</td></tr>"
				+ "<tr><td>Mime Type<td><td>" + escapeHTML(file.mime_type) + "</td></tr>"
				+ "<tr><td>ID<td><td>" + file.id + "</td></tr>"
				+ "<tr><td>Size<td><td class=\"bytecounter\">" + file.size + "</td></tr>"
				+ "<tr><td>Bandwidth<td><td class=\"bytecounter\">" + file.bandwidth_used + "</td></tr>"
				+ "<tr><td>Upload Date<td><td>" + file.date_upload + "</td></tr>"
				+ "</table>"
			);
			Toolbar.setStats(file.views, file.bandwidth_used/file.size);
		}
	}
};

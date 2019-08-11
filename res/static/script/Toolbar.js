/*
 * Time for a more Java-like approach.
 *
 *  Feel free to use this of course
 *
 *  Made by Fornax
 */

/* global Viewer */

var Toolbar = {
	visible: false,
	toggle: function () {
		if (this.visible) {
			if (Sharebar.visible) {
				Sharebar.toggle();
			}

			document.getElementById("toolbar").style.left = "-8em";
			document.getElementById("filepreview").style.left = "0px";
			document.getElementById("button_toggle_toolbar").classList.remove("button_highlight");

			this.visible = false;
		} else {
			document.getElementById("toolbar").style.left = "0px";
			document.getElementById("filepreview").style.left = "8em";
			document.getElementById("button_toggle_toolbar").classList.add("button_highlight");

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
			if(data.responseJSON.success === false) {
				var popupDiv = document.getElementById("captcha_popup");
				var popupTitle = document.getElementById("captcha_popup_title");
				var popupContent = document.getElementById("captcha_popup_content");
				var popupCaptcha = document.getElementById("captcha_popup_captcha");

				if(data.responseJSON.value === "file_rate_limited_captcha_required") {
					popupTitle.innerText = "Rate limiting enabled!";
					popupContent.innerText = "This file is using a suspicious "+
						"amount of bandwidth relative to its popularity. To "+
						"continue downloading this file you will have to "+
						"prove that you're a human first.";
				}else if(data.responseJSON.value === "virus_detected_captcha_required"){
					popupTitle.innerText = "Malware warning!";
					popupContent.innerText = "According to our scanning "+
						"systems this file may contain a virus  of type '"+
						data.responseJSON.extra+"'. You can continue "+
						"downloading this file at your own risk, but you will "+
						"have to prove that you're a human first.";
				}

				// Load the recaptcha script with a load function
				$.getScript("https://www.google.com/recaptcha/api.js?onload=loadCaptcha&render=explicit");

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
		if (navigator.share) {
			navigator.share({
				title: Viewer.title,
				text: "Download " + Viewer.title + " here",
				url: window.location.href
			});
			return;
		}

		if (!Toolbar.visible){
			Toolbar.toggle();
		}

		if(this.visible){
			document.getElementById("sharebar").style.left = "-8em";
			document.getElementById("btnShare").classList.remove("button_highlight")
			this.visible = false;
		}else{
			document.getElementById("sharebar").style.left = "8em";
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

function loadCaptcha(){
	grecaptcha.render("captcha_popup_captcha", {
		sitekey: captchaKey,
		theme: "dark",
		callback: function(token){
			document.getElementById("download_frame").src = "/api/file/" + Viewer.currentFile +
				"?download&recaptcha_response="+token;

			setTimeout(function(){
				var popupDiv = document.getElementById("captcha_popup");
				popupDiv.style.opacity = "0";
				popupDiv.style.visibility = "hidden";
			}, 1000)
		}
	});
}

var DetailsWindow = {
	visible:       false,
	fileID:        "",
	graph:         0,
	popupDiv:      document.getElementById("details_popup"),
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

			// This is a workaround for a chrome bug which makes it so hidden
			// windows can't be scrolled after they are shown
			this.popupDiv.focus();

			if (this.graph === 0) {
				this.renderGraph();
			}
			this.updateGraph(this.fileID);
		}
	},
	setDetails: function (file) {
		var that = this;
		if (Viewer.isList) {
			// Lists give incomplete file information, so we have to request
			// more details in the background. File descriptions only exist in
			// lists, so for that we use the data provided in the page source
			$.ajax({
				dataType: "json",
				url: apiEndpoint + "/file/" + file.id + "/info",
				success: function(data){
					that.fileID = data.id;
					$("#info_file_details").html(
						"<table>"
						+ "<tr><td>Name<td><td>" + escapeHTML(data.name) + "</td></tr>"
						+ "<tr><td>URL<td><td><a href=\"/u/" + data.id + "\">/u/" + data.id + "</a></td></tr>"
						+ "<tr><td>Mime Type<td><td>" + escapeHTML(data.mime_type) + "</td></tr>"
						+ "<tr><td>ID<td><td>" + data.id + "</td></tr>"
						+ "<tr><td>Size<td><td class=\"bytecounter\">" + data.size + "</td></tr>"
						+ "<tr><td>Bandwidth<td><td class=\"bytecounter\">" + data.bandwidth_used + "</td></tr>"
						+ "<tr><td>Upload Date<td><td>" + data.date_upload + "</td></tr>"
						+ "<tr><td>Description<td><td>" + escapeHTML(file.description) + "</td></tr>"
						+ "</table>"
					);
					Toolbar.setStats(data.views, data.bandwidth_used/data.size);
					if(that.visible) {
						that.updateGraph(that.fileID);
					}
				}
			});
		} else {
			this.fileID = file.id;
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
			if(this.visible) {
				this.updateGraph(file.id);
			}
		}
	},
	updateGraph: function(fileID) {
		var that = this;
		console.log("updating graph "+fileID);
		$.get(apiEndpoint+"/file/" + fileID + "/timeseries?interval=60?days=14", function(response){
			console.log(response);
			if (response.success) {
				that.graph.data.labels = response.labels;
				that.graph.data.datasets[0].data = response.downloads;
				that.graph.data.datasets[1].data = response.views;
				that.graph.update();
			}
		});
	},
	renderGraph: function() {
		console.log("rendering graph");
		Chart.defaults.global.defaultFontColor = "#b3b3b3";
		Chart.defaults.global.defaultFontSize = 15;
		Chart.defaults.global.defaultFontFamily = "Ubuntu";
		Chart.defaults.global.aspectRatio = 2.5;
		Chart.defaults.global.elements.point.radius = 0;
		Chart.defaults.global.tooltips.mode = "index";
		Chart.defaults.global.tooltips.axis = "x";
		Chart.defaults.global.tooltips.intersect = false;
		this.graph = new Chart(
			document.getElementById('bandwidth_chart'),
			{
				type: 'line',
				data: {
					datasets: [
						{
							label: "Downloads",
							backgroundColor: "rgba(100, 255, 100, .1)",
							borderColor: "rgba(100, 255, 100, .8)",
							borderWidth: 1,
							fill: true,
							yAxisID: "y_bandwidth",
						}, {
							label: "Views",
							backgroundColor: "rgba(128, 128, 255, .1)",
							borderColor: "rgba(128, 128, 255, .8)",
							borderWidth: 1,
							fill: true,
							yAxisID: "y_views",
						}
					]
				},
				options: {
					scales: {
						yAxes: [
							{
								type: "linear",
								display: true,
								position: "left",
								id: "y_bandwidth",
								scaleLabel: {
									display: true,
									labelString: "Downloads"
								},
								gridLines: {
									color: "rgba(100, 255, 100, .1)"
								}
							}, {
								type: "linear",
								display: true,
								position: "right",
								id: "y_views",
								scaleLabel: {
									display: true,
									labelString: "Views"
								},
								gridLines: {
									color: "rgba(128, 128, 255, .2)"
								}
							}
						],
						xAxes: [
							{
								ticks: {
									maxRotation: 20
								},
								gridLines: {
									display: false
								}
							}
						]
					}
				}
			}
		);
	}
};

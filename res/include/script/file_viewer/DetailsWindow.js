function DetailsWindow(viewer) {let dw = this;
	dw.viewer  = viewer;
	dw.visible = false;
	dw.fileID  = "";
	dw.graph   = 0;

	dw.divPopup        = document.getElementById("details_popup");
	dw.btnDetails      = document.getElementById("btn_details");
	dw.btnCloseDetails = document.getElementById("btn_close_details");
	dw.divFileDetails  = document.getElementById("info_file_details");

	dw.btnDetails.addEventListener("click", () => { dw.toggle(); });
	dw.btnCloseDetails.addEventListener("click", () => { dw.toggle(); });
}

DetailsWindow.prototype.toggle = function() {let dw = this;
	if (dw.visible) {
		dw.divPopup.style.opacity = "0";
		dw.divPopup.style.visibility = "hidden";
		dw.btnDetails.classList.remove("button_highlight");
		dw.visible = false;
	} else {
		dw.divPopup.style.opacity = "1";
		dw.divPopup.style.visibility = "visible";
		dw.btnDetails.classList.add("button_highlight");
		dw.visible = true;

		// This is a workaround for a chrome bug which makes it so hidden
		// windows can't be scrolled after they are shown
		dw.divPopup.focus();

		if (dw.graph === 0) {
			dw.renderGraph();
		}
		dw.updateGraph(dw.fileID);
	}
}

DetailsWindow.prototype.setDetails = function(file) {let dw = this;
	let desc = "";
	if (dw.viewer.isList) {
		desc = file.description;
	}
	dw.fileID = file.id;
	dw.divFileDetails.innerHTML = "<table>"
		+ "<tr><td>Name<td><td>" + escapeHTML(file.name) + "</td></tr>"
		+ "<tr><td>URL<td><td><a href=\"/u/" + file.id + "\">"+domainURL()+"/u/" + file.id + "</a></td></tr>"
		+ "<tr><td>Mime Type<td><td>" + escapeHTML(file.mime_type) + "</td></tr>"
		+ "<tr><td>ID<td><td>" + file.id + "</td></tr>"
		+ "<tr><td>Size<td><td>" + formatDataVolume(file.size, 4) + "</td></tr>"
		+ "<tr><td>Bandwidth<td><td>" + formatDataVolume(file.bandwidth_used, 4) + "</td></tr>"
		+ "<tr><td>Upload Date<td><td>" + file.date_upload + "</td></tr>"
		+ "<tr><td>Description<td><td>" + escapeHTML(desc) + "</td></tr>"
		+ "</table>";

	if(dw.visible) {
		dw.updateGraph(file.id);
	}
}

DetailsWindow.prototype.updateGraph = function(fileID) {let dw = this;
	console.log("updating graph "+fileID);
	fetch(apiEndpoint+"/file/" + fileID + "/timeseries?interval=60?days=14").then(resp => {
		if (!resp.ok) {return null;}
		return resp.json();
	}).then(resp => {
		dw.graph.data.labels = resp.labels;
		dw.graph.data.datasets[0].data = resp.downloads;
		dw.graph.data.datasets[1].data = resp.views;
		dw.graph.update();
	})
}

DetailsWindow.prototype.renderGraph = function() {let dw = this;
	console.log("rendering graph");
	Chart.defaults.global.defaultFontColor = "#b3b3b3";
	Chart.defaults.global.defaultFontSize = 15;
	Chart.defaults.global.defaultFontFamily = "Ubuntu";
	Chart.defaults.global.aspectRatio = 2.5;
	Chart.defaults.global.elements.point.radius = 0;
	Chart.defaults.global.tooltips.mode = "index";
	Chart.defaults.global.tooltips.axis = "x";
	Chart.defaults.global.tooltips.intersect = false;
	dw.graph = new Chart(
		document.getElementById('bandwidth_chart'),
		{
			type: 'line',
			data: {
				datasets: [
					{
						label: "Downloads",
						backgroundColor: "rgba(64, 255, 64, .05)",
						borderColor: "rgba(128, 255, 128, 1)",
						borderWidth: 1.5,
						lineTension: 0.1,
						fill: true,
						yAxisID: "y_bandwidth",
					}, {
						label: "Views",
						backgroundColor: "rgba(64, 64, 255, .1)",
						borderColor: "rgba(128, 128, 255, 1)",
						borderWidth: 1.5,
						lineTension: 0.1,
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

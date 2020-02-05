function DetailsWindow(viewer) {
	this.viewer  = viewer
	this.visible = false
	this.fileID  = ""
	this.graph   = 0

	this.divPopup        = document.getElementById("details_popup")
	this.btnDetails      = document.getElementById("btn_details")
	this.btnCloseDetails = document.getElementById("btn_close_details")
	this.divFileDetails  = document.getElementById("info_file_details")

	this.btnDetails.addEventListener("click",      () => { this.toggle() })
	this.btnCloseDetails.addEventListener("click", () => { this.toggle() })
}

DetailsWindow.prototype.toggle = function() {
	if (this.visible) {
		this.divPopup.style.opacity = "0"
		this.divPopup.style.visibility = "hidden"
		this.btnDetails.classList.remove("button_highlight")
		this.visible = false
	} else {
		this.divPopup.style.opacity = "1"
		this.divPopup.style.visibility = "visible"
		this.btnDetails.classList.add("button_highlight")
		this.visible = true

		// This is a workaround for a chrome bug which makes it so hidden
		// windows can't be scrolled after they are shown
		this.divPopup.focus()

		if (this.graph === 0) {
			this.renderGraph()
		}
		this.updateGraph(this.file)
	}
}

DetailsWindow.prototype.setDetails = function(file) {
	let desc = ""
	if (this.viewer.isList) {
		desc = file.description
	}
	this.fileID = file.id
	this.divFileDetails.innerHTML = "<table>"
		+ "<tr><td>Name<td><td>" + escapeHTML(file.name) + "</td></tr>"
		+ "<tr><td>URL<td><td><a href=\""+file.link+"\">"+file.link+"</a></td></tr>"
		+ "<tr><td>Mime Type<td><td>" + escapeHTML(file.mime_type) + "</td></tr>"
		+ "<tr><td>ID<td><td>" + file.id + "</td></tr>"
		+ "<tr><td>Size<td><td>" + formatDataVolume(file.size, 4) + "</td></tr>"
		+ "<tr><td>Bandwidth<td><td>" + formatDataVolume(file.bandwidth_used, 4) + "</td></tr>"
		+ "<tr><td>Upload Date<td><td>" + printDate(file.date_created, true, true, true) + "</td></tr>"
		+ "<tr><td>Description<td><td>" + escapeHTML(desc) + "</td></tr>"
		+ "</table>"

	if(this.visible && file.timeseries_href !== "") {
		this.updateGraph(file)
	}
}

DetailsWindow.prototype.updateGraph = function(file) {
	console.log("updating graph")
	fetch(file.timeseries_href+"?interval=60?days=14").then(resp => {
		if (!resp.ok) {return null}
		return resp.json()
	}).then(resp => {
		this.graph.data.labels = resp.labels
		this.graph.data.datasets[0].data = resp.downloads
		this.graph.data.datasets[1].data = resp.views
		this.graph.update()
	})
}

DetailsWindow.prototype.renderGraph = function() {
	console.log("rendering graph")
	Chart.defaults.global.defaultFontColor = "#b3b3b3"
	Chart.defaults.global.defaultFontSize = 15
	Chart.defaults.global.defaultFontFamily = "Ubuntu"
	Chart.defaults.global.aspectRatio = 2.5
	Chart.defaults.global.elements.point.radius = 0
	Chart.defaults.global.tooltips.mode = "index"
	Chart.defaults.global.tooltips.axis = "x"
	Chart.defaults.global.tooltips.intersect = false
	this.graph = new Chart(
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
	)
}

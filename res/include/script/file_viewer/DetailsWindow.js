function DetailsWindow(viewer) {
	this.viewer  = viewer
	this.visible = false
	this.file    = null
	this.graphsInitialized = false
	this.graphViews     = 0
	this.graphDownloads = 0
	this.modal   = new Modal(
		document.getElementById("file_viewer"),
		() => { this.toggle() },
		"File Details", "1500px", "1000px",
	)

	let clone = document.getElementById("tpl_details_popup").content.cloneNode(true)
	this.divFileDetails = clone.querySelector(".info_file_details")
	this.modal.setBody(clone)

	this.btnDetails = document.getElementById("btn_details")
	this.btnDetails.addEventListener("click", () => { this.toggle() })
}

DetailsWindow.prototype.toggle = function() {
	if (this.visible) {
		this.modal.close()
		this.btnDetails.classList.remove("button_highlight")
		this.visible = false
	} else {
		this.modal.open()
		this.btnDetails.classList.add("button_highlight")
		this.visible = true

		if (!this.graphsInitialized) {
			this.renderGraphs()
			this.graphsInitialized = true
		}
		this.updateGraph(this.file)
	}
}

DetailsWindow.prototype.setFile = function(file) {
	this.file = file
	let desc = ""
	if (this.viewer.isList) {
		desc = file.description
	}
	this.divFileDetails.innerHTML = "<tr><td>Name<td><td>" + escapeHTML(file.name) + "</td></tr>"
		+ "<tr><td>URL<td><td><a href=\""+file.link+"\">"+file.link+"</a></td></tr>"
		+ "<tr><td>Mime Type<td><td>" + escapeHTML(file.mime_type) + "</td></tr>"
		+ "<tr><td>ID<td><td>" + file.id + "</td></tr>"
		+ "<tr><td>Size<td><td>" + formatDataVolume(file.size, 4) + "</td></tr>"
		+ "<tr><td>Bandwidth<td><td>" + formatDataVolume(file.bandwidth_used, 4) + "</td></tr>"
		+ "<tr><td>Upload Date<td><td>" + printDate(file.date_created, true, true, true) + "</td></tr>"
		+ "<tr><td>Description<td><td>" + escapeHTML(desc) + "</td></tr>"

	if(this.visible && file.timeseries_href !== "") {
		this.updateGraph(file)
	}
}

DetailsWindow.prototype.renderGraphs = function() {
	console.log("rendering graphs")
	this.graphDownloads = drawGraph(
		document.getElementById("downloads_chart"), "Downloads", "number",
	);
	this.graphViews = drawGraph(
		document.getElementById("views_chart"), "Views", "number",
	);
}

DetailsWindow.prototype.updateGraph = function(file) {
	console.log("updating graph")

	let today = new Date()
	let start = new Date()
	start.setDate(start.getDate()-90)

	fetch(
		file.timeseries_href+
		"?start="+start.toISOString() +
		"&end="+today.toISOString() +
		"&interval="+60
	).then(resp => {
		if (!resp.ok) {return null}
		return resp.json()
	}).then(resp => {
		resp.views.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let dateStr = ("00"+(date.getMonth()+1)).slice(-2);
			dateStr += "-"+("00"+date.getDate()).slice(-2);
			dateStr += " "+("00"+date.getHours()).slice(-2)+"h";
			resp.views.timestamps[idx] = "   "+dateStr+"   "; // Poor man's padding
		});
		resp.bandwidth.amounts.forEach((val, idx) => {
			resp.bandwidth.amounts[idx] = Math.round(val/file.size);
		});
		this.graphDownloads.data.labels = resp.views.timestamps
		this.graphViews.data.labels = resp.views.timestamps
		this.graphDownloads.data.datasets[0].data = resp.bandwidth.amounts
		this.graphViews.data.datasets[0].data = resp.views.amounts
		this.graphDownloads.update()
		this.graphViews.update()
	})
}

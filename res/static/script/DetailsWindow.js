var DetailsWindow = {
	visible: false,
	toggle: function () {
		if (this.visible) {
			$("#info_popup").fadeOut(500);
			$("#btnDetails").removeClass("button_highlight");
			this.visible = false;
		} else {
			$("#info_popup").fadeIn(500);
			$("#btnDetails").addClass("button_highlight");
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
						+ "<tr><td>IS<td><td>" + data.id + "</td></tr>"
						+ "<tr><td>Size<td><td class=\"bytecounter\">" + data.size + "</td></tr>"
						+ "<tr><td>Upload Date<td><td>" + data.date_upload + "</td></tr>"
						+ "<tr><td>Description<td><td>" + escapeHTML(file.description) + "</td></tr>"
						+ "</table>"
					);
				}
			});
		} else {
			$("#info_file_details").html(
				"<table>"
				+ "<tr><td>Name<td><td>" + escapeHTML(file.name) + "</td></tr>"
				+ "<tr><td>Mime Type<td><td>" + escapeHTML(file.mime_type) + "</td></tr>"
				+ "<tr><td>ID<td><td>" + file.id + "</td></tr>"
				+ "<tr><td>Size<td><td class=\"bytecounter\">" + file.size + "</td></tr>"
				+ "<tr><td>Upload Date<td><td>" + file.date_upload + "</td></tr>"
				+ "</table>"
			);
		}
	}
};

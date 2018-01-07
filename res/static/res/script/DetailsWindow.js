var DetailsWindow = {
	visible: false,
	toggle: function () {
		if (this.visible) {
			$("#info-popup").fadeOut(500);
			$("#btnDetails").removeClass("button_highlight");
			this.visible = false;
		} else {
			$("#info-popup").fadeIn(500);
			$("#btnDetails").addClass("button_highlight");
			this.visible = true;
		}
	},
	setDetails: function (file) {
		var fileInfo = "<table>"
			+ "<tr><td>Name<td><td>" + escapeHTML(file.file_name) + "</td></tr>"
			+ "<tr><td>Url<td><td><a href=\"/u/" + file.id + "\">Open</a></td></tr>"
			+ "<tr><td>Mime Type<td><td>" + escapeHTML(file.mime_type) + "</td></tr>"
			+ "<tr><td>Id<td><td>" + file.id + "</td></tr>"
			+ "<tr><td>Size<td><td class=\"bytecounter\">" + file.file_size + "</td></tr>"
			+ "<tr><td>Upload Date<td><td>" + file.date_upload + "</td></tr>"
			+ "<tr><td>Description<td><td>" + escapeHTML(file.desc) + "</td></tr>"
			+ "</table>";
		$("#info-fileDetails").html(fileInfo);
	}
};
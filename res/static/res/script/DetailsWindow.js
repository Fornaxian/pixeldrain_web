var DetailsWindow = {
	visible: false,
	toggle: function () {
		if (this.visible) {
			$("#info-popup").fadeOut(500);
			this.visible = false;
		} else {
			$("#info-popup").fadeIn(500);
			this.visible = true;
		}
	},
	setDetails: function (file) {
		var fileInfo = "<table>"
			+ "<tr><td>Name<td><td>" + file.file_name + "</td></tr>"
			+ "<tr><td>Url<td><td><a href=\"/u/" + file.id + "\">Open</a></td></tr>"
			+ "<tr><td>Mime Type<td><td>" + file.mime + "</td></tr>"
			+ "<tr><td>Id<td><td>" + file.id + "</td></tr>"
			+ "<tr><td>Size<td><td class=\"bytecounter\">" + file.file_size + "</td></tr>"
			+ "<tr><td>Upload Date<td><td>" + file.date_upload + "</td></tr>"
			+ "<tr><td>Description<td><td>" + file.desc + "</td></tr>"
			+ "</table>";
		$("#info-fileDetails").html(fileInfo);
	}
};
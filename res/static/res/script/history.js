
/* global API_URL */

var uploads;

$(document).ready(function () {
	var uploadString = $.cookie("pduploads");
	uploadString = uploadString.slice(0, -1);
	uploads = uploadString.split(".");

	uploads.reverse();

	var timeout = 250;
	var itemcount = 0;
	$.each(uploads, function (nr, id) {
		setTimeout(function () {
			$.ajax({
				type: "GET",
				dataType: "json",
				url: APIURL + "/file/" + id + "/info",
				async: true,
				success: function(data) {
					historyAddItem(data);
				},
				error: function(data) {
					historyAddItem(data.responseJSON);
				}
			});
		}, timeout);

		timeout = timeout + 100;
		itemcount++;
		if (itemcount > 1000) {
			return false;
		}
	});
});

function historyAddItem(json) {
	if(!json.success){
		var uploadItem = "<div class=\"uploadItem\" >"
		+ "<img src=\"/res/img/cross.png\" "
		+ "alt=\"File has expired\" "
		+ "class=\"uploadItemImage\" />"
		+ "File has expired"
		+ "</div>";

		$("#uploadedFiles").append($(uploadItem).hide().fadeIn(400));
		
		return;
	}
	
	var date = new Date(json.date_upload * 1000);

	var uploadItem = "<div class=\"uploadItem\" >"
		+ "<a href=\"/u/" + json.id + "\" target=\"_blank\">"
		+ "<img src=\"" + APIURL + json.thumbnail_href + "\" "
		+ "alt=\"" + json.file_name + "\" "
		+ "class=\"uploadItemImage\" />"
		+ json.file_name
		+ "</a>"
		+ "<br/>"
		+ date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
		+ "</div>";

	$("#uploadedFiles").append($(uploadItem).hide().fadeIn(400));
}
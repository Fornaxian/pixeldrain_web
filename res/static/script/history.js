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
				url: apiEndpoint + "/file/" + id + "/info",
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
		var uploadItem = "<div class=\"file_button\" >"
		+ "<img src=\"/res/img/cross.png\" "
		+ "alt=\"File has expired\" />"
		+ "File has expired"
		+ "</div>";

		$("#uploadedFiles").append($(uploadItem).hide().fadeIn(400));

		return;
	}

	var date = new Date(json.date_upload);

	var uploadItem =  '<a href="/u/'+ json.id +'" target="_blank" class="file_button">'
		+ '<img src="'+ apiEndpoint + json.thumbnail_href + '"'
		+ "alt=\"" + json.name + "\" />"
		+ '<span style="color: var(--highlight_color);">'+json.name+'</span>'
		+ "<br/>"
		+ date.getFullYear() + "-"
		+ ("00" + (date.getMonth() + 1)).slice(-2) + "-"
		+ ("00" + date.getDate()).slice(-2)
		+ "</a>";

	$("#uploadedFiles").append($(uploadItem).hide().fadeIn(2000));
}

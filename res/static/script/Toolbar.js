/*
 * Time for a more Java-like approach.
 *
 *  Feel free to use this of course
 *
 *  Made by Fornax
 */

/* global Sharebar, Viewer */

var Toolbar = {
	visible: true,
	toggle: function () {
		if (this.visible) {
			if (Sharebar.visible) {
				Sharebar.toggle();
			}

			$("#toolbar").animate({left: "-132"}, 400);
			$("#filepreview").animate({left: "0"}, 400);

			$("#button-expand-toolbar").css("visibility", "visible");

			this.visible = false;
		} else {
			$("#toolbar").animate({left: "0"}, 400);
			$("#filepreview").animate({left: "122"}, 400);

			setTimeout(function(){
				if(this.visible){
					$("#button-expand-toolbar").css("visibility", "hidden");
				}
			}, 1000)

			this.visible = true;
		}
	},
	download: function () {
		$("#frmDownload").attr("src", "/api/file/" + Viewer.currentFile + "?download");
	},
	downloadList: function(){
		if(!Viewer.isList){
			return;
		}

		$("#frmDownload").attr("src", "/api/list/" + Viewer.listId + "/zip");
	},
	copyUrl: function () {
		$("#copy-text").val(window.location.href);
		$("#copy-text").select();

		try {
			var success = document.execCommand('copy');
			console.log('Text copied');
			$("#btnCopy>span").text("Copied!");
			$("#btnCopy").addClass("button_highlight");
		} catch (err) {
			console.log('Copying not supported');
			$("#btnCopy>span").text("Error!");
			alert("Your browser does not support copying text.");
		}

		// Return to normal
		setTimeout(function(){
			$("#btnCopy>span").text("Copy");
			$("#btnCopy").removeClass("button_highlight");
		}, 60000);
	},
	setViews: function(amount){
		$("#views").html("Views: "+amount);
	}
};

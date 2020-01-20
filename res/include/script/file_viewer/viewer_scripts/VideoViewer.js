class VideoViewer {
	viewer = null;
	file   = null;
	next   = null;

	vidContainer = null;
	vidElement   = null;
	videoSource  = null;

	constructor(viewer, file, next) {let vv = this;
		vv.viewer = viewer;
		vv.file   = file;
		vv.next   = next;

		vv.vidContainer = document.createElement("div");
		vv.vidContainer.classList = "image-container";

		vv.vidElement = document.createElement("video");
		vv.vidElement.autoplay = "autoplay";
		vv.vidElement.controls = "controls";
		vv.vidElement.classList = "center drop-shadow";
		vv.vidElement.addEventListener("ended", () => { vv.next(); }, false);

		vv.videoSource = document.createElement("source");
		vv.videoSource.src = apiEndpoint+"/file/"+vv.file.id;

		vv.vidElement.appendChild(vv.videoSource);
		vv.vidContainer.appendChild(vv.vidElement);
	}

	render(parent) {let vv = this;
		parent.appendChild(vv.vidContainer);
	}
}

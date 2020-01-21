class VideoViewer {
	viewer = null;
	file   = null;
	next   = null;

	vidContainer = null;
	vidElement   = null;
	videoSource  = null;

	constructor(viewer, file, next) {let v = this;
		v.viewer = viewer;
		v.file   = file;
		v.next   = next;

		v.vidContainer = document.createElement("div");
		v.vidContainer.classList = "image-container";

		v.vidElement = document.createElement("video");
		v.vidElement.autoplay = "autoplay";
		v.vidElement.controls = "controls";
		v.vidElement.classList = "center drop-shadow";
		v.vidElement.addEventListener("ended", () => { v.next(); }, false);

		v.videoSource = document.createElement("source");
		v.videoSource.src = apiEndpoint+"/file/"+v.file.id;

		v.vidElement.appendChild(v.videoSource);
		v.vidContainer.appendChild(v.vidElement);
	}

	render(parent) {let v = this;
		parent.appendChild(v.vidContainer);
	}
}

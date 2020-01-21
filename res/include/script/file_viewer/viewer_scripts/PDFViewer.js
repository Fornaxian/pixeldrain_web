class PDFViewer {
	viewer = null;
	file   = null;
	container = null;

	constructor(viewer, file) {let v = this;
		v.viewer = viewer;
		v.file   = file;

		v.container = document.createElement("iframe");
		v.container.classList = "image-container";
		v.container.style.border = "none";
		v.container.src = "/res/misc/pdf-viewer/web/viewer.html?file="+apiEndpoint+"/file/"+file.id;
	}

	render(parent) {let v = this;
		parent.appendChild(v.container);
	}
}

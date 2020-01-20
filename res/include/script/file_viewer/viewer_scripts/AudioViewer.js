class AudioViewer {
	viewer = null;
	file   = null;
	next   = null;

	container = null;
	icon      = null;
	element   = null;
	source    = null;

	constructor(viewer, file, next) {let av = this;
		av.viewer = viewer;
		av.file   = file;
		av.next   = next;

		av.container = document.createElement("div");
		av.container.classList = "image-container";
		av.container.appendChild(document.createElement("br"));

		av.icon = document.createElement("img");
		av.icon.src = "/res/img/mime/audio.png";
		av.container.appendChild(av.icon);

		av.container.appendChild(document.createElement("br"));
		av.container.appendChild(document.createTextNode(file.name));
		av.container.appendChild(document.createElement("br"));
		av.container.appendChild(document.createElement("br"));

		av.element = document.createElement("audio");
		av.element.autoplay = "autoplay";
		av.element.controls = "controls";
		av.element.style.width = "90%";
		av.element.addEventListener("ended", () => { av.next(); }, false);

		av.source = document.createElement("source");
		av.source.src = apiEndpoint+"/file/"+av.file.id;
		av.element.appendChild(av.source);
		av.container.appendChild(av.element);
	}

	render(parent) {let av = this;
		parent.appendChild(av.container);
	}
}

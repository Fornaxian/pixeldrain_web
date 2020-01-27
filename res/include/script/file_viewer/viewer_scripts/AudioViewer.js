function AudioViewer(viewer, file, next) {let v = this;
	v.viewer = viewer;
	v.file   = file;
	v.next   = next;

	v.container = document.createElement("div");
	v.container.classList = "image-container";
	v.container.appendChild(document.createElement("br"));

	v.icon = document.createElement("img");
	v.icon.src = "/res/img/mime/audio.png";
	v.container.appendChild(v.icon);

	v.container.appendChild(document.createElement("br"));
	v.container.appendChild(document.createTextNode(file.name));
	v.container.appendChild(document.createElement("br"));
	v.container.appendChild(document.createElement("br"));

	v.element = document.createElement("audio");
	v.element.autoplay = "autoplay";
	v.element.controls = "controls";
	v.element.style.width = "90%";
	v.element.addEventListener("ended", () => { v.next(); }, false);

	v.source = document.createElement("source");
	v.source.src = apiEndpoint+"/file/"+v.file.id;
	v.element.appendChild(v.source);
	v.container.appendChild(v.element);
}

AudioViewer.prototype.render = function(parent) {let v = this;
	parent.appendChild(v.container);
}

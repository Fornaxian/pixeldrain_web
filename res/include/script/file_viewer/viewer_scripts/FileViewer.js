function FileViewer(viewer, file, next) {let v = this;
	v.viewer = viewer;
	v.file   = file;
	v.next   = next;

	v.container = document.createElement("div");
	v.container.classList = "image-container";
	v.container.appendChild(document.createElement("br"));

	v.icon = document.createElement("img");
	v.icon.src = apiEndpoint+"/"+file.thumbnail_href;
	v.container.appendChild(v.icon);

	v.container.appendChild(document.createElement("br"));
	v.container.appendChild(document.createTextNode(file.name));
	v.container.appendChild(document.createElement("br"));
	v.container.appendChild(document.createTextNode("Type: "+file.mime_type));
	v.container.appendChild(document.createElement("br"));
	v.container.appendChild(document.createElement("br"));
	v.container.appendChild(document.createTextNode(
		"Press the 'Download' button in the menu to download this file"
	));
}

FileViewer.prototype.render = function(parent) {let v = this;
	parent.appendChild(v.container);
}

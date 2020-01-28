function TextViewer(viewer, file) {
	this.viewer      = viewer;
	this.file        = file;
	this.pre         = null;
	this.prettyprint = null;

	this.container = document.createElement("div");
	this.container.classList = "text-container";

	if (file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.id === "demo") {
		this.getMarkdown();
	} else {
		this.getText();
	}
}

TextViewer.prototype.getText = function() {
	this.pre = document.createElement("pre");
	this.pre.classList = "pre-container prettyprint linenums";
	this.pre.innerText = "Loading...";
	this.container.appendChild(this.pre);

	if (this.file.size > 1<<22) { // File larger than 4 MiB
		this.pre.innerText = "File is too large to view online.\nPlease download and view it locally.";
		return;
	}

	fetch(apiEndpoint+"/file/"+this.file.id).then(resp => {
		if (!resp.ok) { return Promise.reject(resp.status); }
		return resp.text();
	}).then(resp => {
		this.pre.innerText = resp;

		// Load prettyprint script
		this.prettyprint = document.createElement("script");
		this.prettyprint.src = "https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?skin=desert";
		this.container.appendChild(this.prettyprint);
	}).catch(err => {
		this.pre.innerText = "Error loading file: "+err;
	});
}

TextViewer.prototype.getMarkdown = function() {
	fetch("/u/"+this.file.id+"/preview").then(resp => {
		if (!resp.ok) { return Promise.reject(resp.status); }
		return resp.text();
	}).then(resp => {
		this.container.innerHTML = resp;
	}).catch(err => {
		this.container.innerText = "Error loading file: "+err;
	});
}

TextViewer.prototype.render = function(parent) {
	parent.appendChild(this.container);
}

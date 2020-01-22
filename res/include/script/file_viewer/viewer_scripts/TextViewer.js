class TextViewer {
	constructor(viewer, file) {let v = this;
		v.viewer      = viewer;
		v.file        = file;
		v.pre         = null;
		v.prettyprint = null;

		v.container = document.createElement("div");
		v.container.classList = "text-container";

		if (file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.id === "demo") {
			v.getMarkdown();
		} else {
			v.getText();
		}
	}

	getText() {let v = this;
		v.pre = document.createElement("pre");
		v.pre.classList = "pre-container prettyprint linenums";
		v.pre.innerText = "Loading...";
		v.container.appendChild(v.pre);

		if (v.file.size > 1<<22) { // File larger than 4 MiB
			v.pre.innerText = "File is too large to view online.\nPlease download and view it locally.";
			return;
		}

		fetch(apiEndpoint+"/file/"+v.file.id).then(resp => {
			if (!resp.ok) { return Promise.reject(resp.status); }
			return resp.text();
		}).then(resp => {
			v.pre.innerText = resp;

			// Load prettyprint script
			v.prettyprint = document.createElement("script");
			v.prettyprint.src = "https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?skin=desert";
			v.container.appendChild(v.prettyprint);
		}).catch(err => {
			v.pre.innerText = "Error loading file: "+err;
		});
	}

	getMarkdown() {let v = this;
		fetch("/u/"+v.file.id+"/preview").then(resp => {
			if (!resp.ok) { return Promise.reject(resp.status); }
			return resp.text();
		}).then(resp => {
			v.container.innerHTML = resp;
		}).catch(err => {
			v.container.innerText = "Error loading file: "+err;
		});
	}

	render(parent) {let v = this;
		parent.appendChild(v.container);
	}
}

function FileManager(windowElement) {
	this.window          = windowElement;
	this.navBar          = this.window.querySelector("#nav_bar");
	this.btnMenu         = this.navBar.querySelector("#btn_menu");
	this.btnBack         = this.navBar.querySelector("#btn_back");
	this.btnUp           = this.navBar.querySelector("#btn_up");
	this.btnForward      = this.navBar.querySelector("#btn_forward");
	this.btnHome         = this.navBar.querySelector("#btn_home");
	this.breadcrumbs     = this.navBar.querySelector("#breadcrumbs");
	this.btnReload       = this.navBar.querySelector("#btn_reload");
	this.inputSearch     = this.navBar.querySelector("#input_search");
	this.directoryArea   = this.window.querySelector("#directory_area");
	this.directoryFooter = this.window.querySelector("#directory_footer");

	this.dirContainer = document.createElement("div");
	this.directoryArea.appendChild(this.dirContainer);

	this.inputSearch.addEventListener("keyup", (e) => {
		this.search(this.inputSearch.value);
	})
	this.directoryArea.addEventListener("scroll", (e) => {
		this.renderVisibleFiles(this.visibleFiles, false);
	})

	this.allFiles     = [];
	this.visibleFiles = [];

	this.lastScrollTop = 0;
}

FileManager.prototype.search = function(term) {
	if (term === "") {
		this.visibleFiles = this.allFiles;
		this.renderVisibleFiles(this.visibleFiles, true);
		return
	}

	this.visibleFiles = [];

	term = term.toLowerCase();
	for (let i in this.allFiles) {
		if (this.allFiles[i].name.toLowerCase().includes(term)) {
			this.visibleFiles.push(this.allFiles[i]);
		}
	}
	this.renderVisibleFiles(this.visibleFiles, true);
}

FileManager.prototype.getDirectory = function(path) {
	console.log("ayy!");
}

FileManager.prototype.getUserFiles = function() {
	let getAll = (page) => {
		fetch(apiEndpoint+"/user/files?page="+page+"&limit=10000").then(resp => {
			if (!resp.ok) {Promise.reject("yo");}
			return resp.json();
		}).then(resp => {
			if (page === 0) {
				this.allFiles = resp.files;
			} else {
				this.allFiles = this.allFiles.concat(resp.files);
			}

			this.allFiles.sort((a, b) => {
				return a.name.localeCompare(b.name);
			});
			this.visibleFiles = this.allFiles;

			this.renderVisibleFiles(this.visibleFiles, true);

			if (resp.files.length === 10000) {
				getAll(page+1);
			}
		}).catch((err) => {
			console.log("Req failed:" + err);
		})
	}

	getAll(0);
}

FileManager.prototype.renderVisibleFiles = function(files, freshStart) {
	if (freshStart) {
		this.dirContainer.innerHTML = "";

		let totalSize = 0;
		for (let i in files) {
			totalSize += files[i].size;
		}
		this.directoryFooter.innerText = files.length+
			" items (0 directories and "+
			files.length+
			" files). Total size: "
			+formatDataVolume(totalSize, 4);
	}

	let scrollDown = this.lastScrollTop <= this.directoryArea.scrollTop;
	this.lastScrollTop = this.directoryArea.scrollTop;

	let fileHeight     = 32;
	let totalHeight    = (files.length * fileHeight)+38;
	let viewportHeight = this.directoryArea.clientHeight;
	let paddingTop     = this.lastScrollTop - this.lastScrollTop%fileHeight;
	if (paddingTop < 0) { paddingTop = 0;}
	let paddingBottom  = totalHeight - paddingTop - viewportHeight - this.lastScrollTop%fileHeight;
	if (paddingBottom < 0) {paddingBottom = 0;}

	// Pad the items out which we're not going to show
	this.dirContainer.style.marginTop = paddingTop+"px";
	this.dirContainer.style.marginBottom = paddingBottom+"px";

	let start = Math.floor(paddingTop/fileHeight);
	let end   = Math.ceil((paddingTop+viewportHeight)/fileHeight);
	if (end > files.length) { end = files.length-1; }

	// First remove the elements which are out of bounds
	let firstEl;
	let firstIdx = -1;
	let lastEl;
	let lastIdx = -1;
	while (true && !freshStart) {
		firstEl  = this.dirContainer.firstElementChild;
		if (firstEl === null) {break;}
		firstIdx = Number.parseInt(firstEl.getAttribute("fileindex"));
		lastEl   = this.dirContainer.lastElementChild;
		lastIdx  = Number.parseInt(lastEl.getAttribute("fileindex"));

		if (firstIdx < start) {
			this.dirContainer.removeChild(firstEl);
			console.debug("Remove start "+firstIdx);
		} else if (lastIdx > end) {
			this.dirContainer.removeChild(lastEl);
			console.debug("Remove end "+lastIdx);
		} else {
			break;
		}
	}

	console.debug("Start "+start+" end "+end+" first el "+firstIdx+" last el "+lastIdx);

	let makeButton = (i, file) => {
		let el = document.createElement("a");
		el.classList = "node";
		el.href = "/u/"+file.id;
		el.target = "_blank";
		el.title = file.name;
		el.setAttribute("fileindex", i);

		let thumb = document.createElement("img");
		thumb.src = apiEndpoint+"/file/"+file.id+"/thumbnail?width=32&height=32";

		let label = document.createElement("span");
		label.innerText = file.name;

		el.appendChild(thumb);
		el.appendChild(label);
		return el;
	}

	// Then add the elements which have become visible. When the user scrolls
	// down we can append the items in chronologic order, but when the user
	// scrolls up we have to prepend the items in reverse order to avoid them
	// appearing from high to low.
	if (scrollDown) {
		for (let i = start; i <= end && i < files.length; i++) {
			if (firstIdx !== -1 && lastIdx !== -1 && i >= firstIdx && i <= lastIdx) {
				continue;
			}

			this.dirContainer.append(makeButton(i, files[i]));
			console.debug("Append "+i+" "+files[i].name);
		}
	} else {
		for (let i = end; i >= start && i < files.length; i--) {
			if (firstIdx !== -1 && lastIdx !== -1 && i >= firstIdx && i <= lastIdx) {
				continue;
			}
			this.dirContainer.prepend(makeButton(i, files[i]));
			console.debug("Prepend "+i+" "+files[i].name);
		}
	}
}

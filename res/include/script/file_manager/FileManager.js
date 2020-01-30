function FileManager(windowElement) {
	this.window           = windowElement;
	this.navBar           = this.window.querySelector("#nav_bar");
	this.btnMenu          = this.navBar.querySelector("#btn_menu");
	this.btnBack          = this.navBar.querySelector("#btn_back");
	this.btnUp            = this.navBar.querySelector("#btn_up");
	this.btnForward       = this.navBar.querySelector("#btn_forward");
	this.btnHome          = this.navBar.querySelector("#btn_home");
	this.breadcrumbs      = this.navBar.querySelector("#breadcrumbs");
	this.btnReload        = this.navBar.querySelector("#btn_reload");
	this.inputSearch      = this.navBar.querySelector("#input_search");
	this.directorySorters = this.window.querySelector("#directory_sorters");
	this.directoryArea    = this.window.querySelector("#directory_area");
	this.directoryFooter  = this.window.querySelector("#directory_footer");

	// Sorters
	this.currentSortField = "";
	this.currentSortAscending = true;

	this.btnSortName = document.createElement("div");
	this.btnSortName.innerText = "Name";
	this.btnSortName.addEventListener("click", () => { this.sortBy("name"); });
	this.directorySorters.appendChild(this.btnSortName);

	this.btnSortType = document.createElement("div");
	this.btnSortType.innerText = "Type";
	this.btnSortType.addEventListener("click", () => { this.sortBy("type"); });
	this.directorySorters.appendChild(this.btnSortType);

	this.btnSortSize = document.createElement("div");
	this.btnSortSize.innerText = "Size";
	this.btnSortSize.addEventListener("click", () => { this.sortBy("size"); });
	this.directorySorters.appendChild(this.btnSortSize);

	// Buttons
	this.btnReload.addEventListener("click", () => { this.getUserFiles(); })

	this.dirContainer = document.createElement("div");
	this.directoryArea.appendChild(this.dirContainer);

	this.inputSearch.addEventListener("keyup", (e) => {
		this.search(this.inputSearch.value);
	})
	this.directoryArea.addEventListener("scroll", (e) => {
		this.renderVisibleFiles(this.visibleFiles, false);
	})

	// type: {icon, name, href, type, size}
	this.allFiles     = [];
	this.visibleFiles = [];

	this.lastScrollTop = 0;
}

FileManager.prototype.setSpinner = function() {
	this.window.appendChild(document.getElementById("tpl_spinner").content.cloneNode(true));
}
FileManager.prototype.delSpinner = function() {
	for (let i in this.window.children) {
		if (
			typeof(this.window.children[i].classList) === "object" &&
			this.window.children[i].classList.contains("spinner")
		) {
			this.window.children[i].remove();
		}
	}
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
	this.setSpinner();

	let getAll = (page) => {
		fetch(apiEndpoint+"/user/files?page="+page+"&limit=10000").then(resp => {
			if (!resp.ok) {Promise.reject("yo");}
			return resp.json();
		}).then(resp => {
			for (let i in resp.files) {
				this.allFiles.push({
					icon: apiEndpoint+"/file/"+resp.files[i].id+"/thumbnail?width=32&height=32",
					name: resp.files[i].name,
					href: "/u/"+resp.files[i].id,
					type: resp.files[i].mime_type,
					size: resp.files[i].size
				})
			}

			this.visibleFiles = this.allFiles;
			this.currentSortField = "";
			this.sortBy("name");

			if (resp.files.length === 10000) {
				getAll(page+1);
			} else {
				// Less than 10000 results means we're done loading, we can
				// remove the loading spinner
				this.delSpinner();
			}
		}).catch((err) => {
			this.delSpinner();
			console.log("Req failed:" + err);
		})
	}

	getAll(0);
}

FileManager.prototype.getUserLists = function() {
	this.setSpinner();

	let getAll = (page) => {
		fetch(apiEndpoint+"/user/lists?page="+page+"&limit=10000").then(resp => {
			if (!resp.ok) {Promise.reject("yo");}
			return resp.json();
		}).then(resp => {
			for (let i in resp.lists) {
				this.allFiles.push({
					icon: apiEndpoint+"/list/"+resp.lists[i].id+"/thumbnail?width=32&height=32",
					name: resp.lists[i].title,
					href: "/l/"+resp.lists[i].id,
					type: "list",
					size: 0
				})
			}

			this.visibleFiles = this.allFiles;
			this.currentSortField = "";
			this.sortBy("name");

			if (resp.lists.length === 10000) {
				getAll(page+1);
			} else {
				// Less than 10000 results means we're done loading, we can
				// remove the loading spinner
				this.delSpinner();
			}
		}).catch((err) => {
			this.delSpinner();
			console.log("Req failed:" + err);
		})
	}

	getAll(0);
}

FileManager.prototype.sortBy = function(field) {
	if (this.currentSortField !== field) {
		this.currentSortAscending = true;
		this.currentSortField = field;
	} else if (this.currentSortField === field) {
		this.currentSortAscending = !this.currentSortAscending;
	}

	this.visibleFiles.sort((a, b) => {
		if (this.currentSortAscending) {
			return a[field].localeCompare(b[field]);
		} else {
			return b[field].localeCompare(a[field]);
		}
	});
	this.renderVisibleFiles(this.visibleFiles, true);
}

FileManager.prototype.renderVisibleFiles = function(files, freshStart) {
	let scrollDown = this.lastScrollTop <= this.directoryArea.scrollTop;
	this.lastScrollTop = this.directoryArea.scrollTop;

	let fileMargin     = 4;
	let fileHeight     = 32 + fileMargin;
	let totalHeight    = (files.length * fileHeight);
	let viewportHeight = this.directoryArea.clientHeight;

	if (freshStart) {
		this.dirContainer.innerHTML = "";
		this.dirContainer.style.height = totalHeight+"px";
		this.dirContainer.scrollTop = 0;
		this.lastScrollTop = 0;
		scrollDown = true;

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

	let paddingTop = this.lastScrollTop - this.lastScrollTop%fileHeight;
	let start = Math.floor(paddingTop/fileHeight) - 5;
	if (start < 0) { start = 0; }

	let end   = Math.ceil((paddingTop+viewportHeight)/fileHeight) + 5;
	if (end > files.length) { end = files.length-1; }

	this.dirContainer.style.paddingTop = (start*fileHeight)+"px";

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
		el.href = file.href;
		el.target = "_blank";
		el.title = file.name;
		el.setAttribute("fileindex", i);

		let thumb = document.createElement("img");
		thumb.src = file.icon;

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

function renderFileButton(apiURL, id, title, subtitle) {
	let btn                = document.createElement("a");
	btn.classList          = "file_button";
	btn.href               = "/u/"+id;
	btn.target             = "_blank";
	let thumbnail          = document.createElement("img");
	thumbnail.src          = apiURL+"/file/"+id+"/thumbnail?width=80&height=80";
	thumbnail.alt          = title;
	let titleSpan          = document.createElement("span");
	titleSpan.classList    = "file_button_title";
	titleSpan.innerText    = title;
	let br                 = document.createElement("br");
	let subtitleSpan       = document.createElement("span");
	subtitleSpan.classList = "file_button_subtitle";
	subtitleSpan.innerText = subtitle;

	btn.appendChild(thumbnail);
	btn.appendChild(titleSpan);
	btn.appendChild(br);
	btn.appendChild(subtitleSpan);
	return btn;
}

function getCookie(name) {
	var result = new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)').exec(document.cookie);
	return result ? result[1] : null;
}

// Get the uploads from localstorage
let uploadsStr = localStorage.getItem("uploaded_files");
if (uploadsStr === null) { uploadsStr = ""; }

let uploads = Array();

if (uploadsStr != "") {
	uploadsStr = uploadsStr.slice(0, -1); // Strip the trailing comma
	uploads = uploadsStr.split(",");
}

// Get the uploads from a cookie
uploadsStr = getCookie("pduploads");
if (uploadsStr === null) { uploadsStr = ""; }

if (uploadsStr != "") {
	uploadsStr = uploadsStr.slice(0, -1); // Strip the trailing dot
	uploads.push(uploadsStr.split(".").reverse());
}

// Render all the items
function getHistoryItem() {
	let item = uploads.shift();
	if (item === undefined || item === "") { return; }

	fetch(
		apiEndpoint+"/file/"+item+"/info"
	).then(resp => {
		if (!resp.ok) {
			return Promise.reject();
		}
		return resp.json();
	}).then(resp => {
		let date = new Date(resp.date_upload);
		document.getElementById("uploaded_files").appendChild(
			renderFileButton(
				apiEndpoint,
				resp.id,
				resp.name,
				date.getFullYear()+"-"+("00"+(date.getMonth()+1)).slice(-2)+"-"+("00"+date.getDate()).slice(-2)
			)
		);
		getHistoryItem();
	}).catch(err => {
		console.log("Fetch failed: "+err)
		getHistoryItem();
	})
}

getHistoryItem();

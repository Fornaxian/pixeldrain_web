function UploadManager(apiAddress, uploadsFinished) {let um = this;

	um.apiAddress = apiAddress;

	// Callback function for when the queue is empty
	um.uploadsFinished = uploadsFinished;

	// Counts the total number of upload jobs
	um.jobCounter = 0;

	// Queue of files to be uploaded. Format:
	// {
	//	jobID: number,
	//	file: Blob,
	//	name: string,
	//	onProgress: function,
	//	onFinished: function,
	//	onFailure: function,
	//	tries: number
	// }
	um.uploadQueue = [];

	// Here we put successful jobs. The array should be sorted by job ID.
	// Format:
	// { jobID: number, fileID: string, fileName: string }
	um.uploadLog = [];

	// Max number of uploading threads at once
	um.maxWorkers = 3;

	// Threads which are currently uploading
	um.activeWorkers = 0;

	// Total number of jobs accepted
	um.jobCounter = 0;
}

UploadManager.prototype.finishedUploads = function() {let um = this;
	um.uploadLog.sort(function(a, b) {
		return a.jobID - b.jobID;
	})
	return um.uploadLog;
}

UploadManager.prototype.addFile = function(
	file, // Blob
	name, // string
	onProgress, // func (progress: number)
	onFinished, // func (id: string)
	onFailure // func (errorID: string, errorMessage: string)
) {let um = this;
	um.uploadQueue.push({
		jobID: um.jobCounter,
		file: file,
		name: name,
		onProgress: onProgress,
		onFinished: onFinished,
		onFailure: onFailure,
		tries: 0
	});

	// Increment the job counter
	um.jobCounter++

	if (um.activeWorkers < um.maxWorkers) {
		// Run the upload function
		um.startUpload();
	}
}

UploadManager.prototype.startUpload = function() {let um = this;
	if (um.uploadQueue.length === 0) {
		return; // Nothing to upload
	}

	if (um.activeWorkers < um.maxWorkers) {
		um.activeWorkers++;
		um.uploadThread();
	}
}

UploadManager.prototype.finishUpload = function() {let um = this;
	um.activeWorkers--;

	if (
		um.uploadQueue.length === 0 &&
		um.activeWorkers === 0 &&
		typeof(um.uploadsFinished) === "function"
	) {
		um.uploadsFinished();
		return;
	}

	// Run the upload function for the next file
	um.startUpload();
}

UploadManager.prototype.uploadThread = function() {let um = this;
	let job = um.uploadQueue.shift(); // Get the first element of the array
	console.debug("Starting upload of " + job.name);

	let form = new FormData();
	form.append("name", job.name);
	form.append('file', job.file);

	let xhr = new XMLHttpRequest();
	xhr.open("POST", um.apiAddress + "/file", true);
	xhr.timeout = 21600000; // 6 hours, to account for slow connections

	// Report progress updates back to the caller
	xhr.upload.addEventListener("progress", function (evt) {
		if (evt.lengthComputable && typeof(job.onProgress) === "function") {
			job.onProgress(evt.loaded / evt.total);
		}
	});

	xhr.onreadystatechange = function () {
		// readystate 4 means the upload is done
		if (xhr.readyState !== 4) { return; }

		if (xhr.status >= 100 && xhr.status < 400) {
			// Request is a success
			let resp = JSON.parse(xhr.response);
			addUploadHistory(resp.id)

			// Log the successful job
			um.uploadLog.push({
				jobID: job.jobID,
				fileID: resp.id,
				fileName: job.name
			});

			if (typeof(job.onFinished) === "function") {
				job.onFinished(resp.id);
			}

			// Finish the upload job
			um.finishUpload();
		} else if (xhr.status >= 400) {
			// Request failed
			console.log("Upload error. status: " + xhr.status + " response: " + xhr.response);
			let resp = JSON.parse(xhr.response);
			if (job.tries === 3) { // Upload failed
				job.onFailure(resp.value, resp.message);
			} else { // Try again
				job.tries++;
				um.uploadQueue.push(job);
			}

			// Sleep the upload thread for 5 seconds
			window.setTimeout(() => { um.finishUpload(); }, 5000);
		} else {
			// Request did not arrive
			if (job.tries === 3) { // Upload failed
				if (typeof(job.onFailure) === "function") {
					job.onFailure(xhr.response, xhr.response);
				}
			} else { // Try again
				job.tries++;
				um.uploadQueue.push(job);
			}

			// Sleep the upload thread for 5 seconds
			window.setTimeout(() => { um.finishUpload(); }, 5000);
		}
	};
	xhr.send(form);
}

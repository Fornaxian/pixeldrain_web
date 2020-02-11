function UploadManager(uploadEndpoint, uploadsFinished) {
	this.uploadEndpoint = uploadEndpoint;

	// Callback function for when the queue is empty
	this.uploadsFinished = uploadsFinished;

	// Counts the total number of upload jobs
	this.jobCounter = 0;

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
	this.uploadQueue = [];

	// Here we put successful jobs. The array should be sorted by job ID.
	// Format:
	// { jobID: number, fileID: string, fileName: string }
	this.uploadLog = [];

	// Max number of uploading threads at once
	this.maxWorkers = 3;

	// Threads which are currently uploading
	this.activeWorkers = 0;

	// Total number of jobs accepted
	this.jobCounter = 0;
}

UploadManager.prototype.finishedUploads = function() {
	this.uploadLog.sort((a, b) => {
		return a.jobID - b.jobID;
	})
	return this.uploadLog;
}

UploadManager.prototype.addFile = function(
	file, // Blob
	name, // string
	onProgress, // func (progress: number)
	onFinished, // func (id: string)
	onFailure // func (errorID: string, errorMessage: string)
) {
	this.uploadQueue.push({
		jobID: this.jobCounter,
		file: file,
		name: name,
		onProgress: onProgress,
		onFinished: onFinished,
		onFailure: onFailure,
		tries: 0
	});

	// Increment the job counter
	this.jobCounter++

	if (this.activeWorkers < this.maxWorkers) {
		// Run the upload function
		this.startUpload();
	}
}

UploadManager.prototype.startUpload = function() {
	if (this.uploadQueue.length === 0) {
		return; // Nothing to upload
	}

	if (this.activeWorkers < this.maxWorkers) {
		this.activeWorkers++;
		this.uploadThread();
	}
}

UploadManager.prototype.finishUpload = function() {
	this.activeWorkers--;

	if (
		this.uploadQueue.length === 0 &&
		this.activeWorkers === 0 &&
		typeof(this.uploadsFinished) === "function"
	) {
		this.uploadsFinished();
		return;
	}

	// Run the upload function for the next file
	this.startUpload();
}

UploadManager.prototype.uploadThread = function() {
	let job = this.uploadQueue.shift(); // Get the first element of the array
	console.debug("Starting upload of " + job.name);

	let form = new FormData();
	form.append('file', job.file, job.name);

	let xhr = new XMLHttpRequest();
	xhr.open("POST", this.uploadEndpoint, true);
	xhr.timeout = 21600000; // 6 hours, to account for slow connections

	// Report progress updates back to the caller
	xhr.upload.addEventListener("progress", evt => {
		if (evt.lengthComputable && typeof(job.onProgress) === "function") {
			job.onProgress(evt.loaded / evt.total);
		}
	});

	xhr.onreadystatechange = () => {
		// readystate 4 means the upload is done
		if (xhr.readyState !== 4) { return; }

		if (xhr.status >= 100 && xhr.status < 400) {
			// Request is a success
			let resp = JSON.parse(xhr.response);
			addUploadHistory(resp.id)

			// Log the successful job
			this.uploadLog.push({
				jobID: job.jobID,
				fileID: resp.id,
				fileName: job.name
			});

			if (typeof(job.onFinished) === "function") {
				job.onFinished(resp.id);
			}

			// Finish the upload job
			this.finishUpload();
		} else if (xhr.status >= 400) {
			// Request failed
			console.log("Upload error. status: " + xhr.status + " response: " + xhr.response);
			let resp = JSON.parse(xhr.response);
			if (job.tries === 3) { // Upload failed
				job.onFailure(resp.value, resp.message);
			} else { // Try again
				job.tries++;
				this.uploadQueue.push(job);
			}

			// Sleep the upload thread for 5 seconds
			window.setTimeout(() => { this.finishUpload(); }, 5000);
		} else {
			// Request did not arrive
			if (job.tries === 3) { // Upload failed
				if (typeof(job.onFailure) === "function") {
					job.onFailure(xhr.responseText, xhr.responseText);
				}
			} else { // Try again
				job.tries++;
				this.uploadQueue.push(job);
			}

			// Sleep the upload thread for 5 seconds
			window.setTimeout(() => { this.finishUpload(); }, 5000);
		}
	};
	xhr.send(form);
}

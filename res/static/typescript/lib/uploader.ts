declare var apiEndpoint: string;

interface FileUpload {
	file: Blob
	name: string
	onProgress(progress: number)
	onFinished(id: string)
	onFailure(errorID: string, errorMessage: string)
}

class UploadManager {
	private uploadQueue:   Array<FileUpload>   = new Array();
	private uploadThreads: Array<UploadWorker> = new Array();
	private maxThreads:    number              = 3;

	public uploadFile(file: FileUpload) {
		console.debug("Adding upload to queue")
		this.uploadQueue.push(file);

		if (this.uploadThreads.length < this.maxThreads) {
			console.debug("Starting upload thread")
			let thread = new UploadWorker(this)
			this.uploadThreads.push(thread)
			setTimeout(function(){thread.start()}, 0) // Start a new upload thread
		} else {
			for (var i = 0; i < this.uploadThreads.length; i++) {
				this.uploadThreads[i].start()
			}
		}
	}

	public uploading(): boolean {
		for (var i = 0; i < this.uploadThreads.length; i++) {
			if (this.uploadThreads[i].isUploading()) {
				return true;
			}
		}
		return false;
	}

	public grabFile(): FileUpload | undefined {
		if (this.uploadQueue.length > 0) {
			return this.uploadQueue.shift()
		} else {
			return undefined
		}
	}
}

class UploadWorker {
	private manager:   UploadManager
	private tries:     number  = 0
	private uploading: boolean = false
	public  isUploading(): boolean {return this.uploading;}

	constructor(manager: UploadManager) {
		this.manager = manager
	}
	public start(){
		if (!this.uploading) {
			this.newFile()
		}
	}

	private newFile() {
		var file = this.manager.grabFile()
		if (file === undefined) { // No more files in the queue. We're finished
			this.uploading = false
			console.debug("No files left in queue")
			return // Stop the thread
		}

		this.uploading = true
		this.tries = 0
		this.upload(<FileUpload>file)
	}

	private upload(file: FileUpload){
		console.debug("Starting upload of " + file.name)

		var that = this // jquery changes the definiton of "this"

		var formData = new FormData()
		formData.append("name", file.name)
		formData.append('file', file.file)

		var xhr = new XMLHttpRequest()
		xhr.open("POST", apiEndpoint+"/file")
		xhr.timeout = 21600000 // 6 hours, to account for slow connections

		// Update progess bar on progress
		xhr.upload.addEventListener("progress", function (evt) {
			if (evt.lengthComputable) {
				file.onProgress(evt.loaded / evt.total)
			}
		});

		xhr.onreadystatechange = function(){
			if (xhr.readyState !== 4) {return;}
			console.log("status: "+xhr.status)

			if (xhr.status >= 100 && xhr.status < 400) {
				var resp = JSON.parse(xhr.response);
				// Request is a success
				file.onFinished(resp.id)
				that.setHistoryCookie(resp.id)
				that.newFile() // Continue uploading on this thread
			} else {
				var value, message
				if (xhr.status >= 400) {
					var resp = JSON.parse(xhr.response);
					value = resp.value
					message = resp.message
				}
				console.log("Upload error. status: "+xhr.status+" response: "+xhr.response)

				if (that.tries === 3) {
					file.onFailure(value, message)

					setTimeout(function(){that.newFile()}, 2000) // Try to continue
					return; // Upload failed
				}

				// Try again
				that.tries++
				setTimeout(function(){that.upload(file)}, that.tries*5000)
			}
		}

		xhr.send(formData)
	}

	private setHistoryCookie(id: string){
		// Make sure the user is not logged in, for privacy. This keeps the
		// files uploaded while logged in and anonymously uploaded files
		// separated
		if (Cookie.read("pd_auth_key") !== null) {
			return;
		}

		var uc = Cookie.read("pduploads")

		// First upload in this browser
		if (uc === null) {
			Cookie.write("pduploads", id + ".", undefined)
			return
		}

		if (uc.length > 2000){
			// Cookie is becoming too long, drop the oldest two files
			uc = uc.substring(
				uc.indexOf(".") + 1
			).substring(
				uc.indexOf(".") + 1
			)
		}

		Cookie.write("pduploads", uc + id + ".", undefined)
	}
}

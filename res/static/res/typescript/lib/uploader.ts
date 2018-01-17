interface FileUpload {
	file: File
	onProgress(progress: number)
	onFinished(id: string)
	onFailure(response: JQuery.Ajax.ErrorTextStatus, error: string)
}

class UploadManager {
	private uploadQueue:   Array<FileUpload>   = new Array();
	private uploadThreads: Array<UploadWorker> = new Array();
	private maxThreads:    number              = 2;

	public uploadFile(file: FileUpload) {
		console.debug("Adding upload to queue")
		this.uploadQueue.push(file);

		if (this.uploadThreads.length < this.maxThreads) {
			console.debug("Starting upload thread")
			let thread = new UploadWorker(this)
			this.uploadThreads.push(thread)
			setTimeout(thread.start(), 0) // Start a new upload thread
		} else {
			for (var i = 0; i < this.uploadThreads.length; i++) {
				this.uploadThreads[i].startIfInactive()
			}
		}
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

	constructor(manager: UploadManager) {
		this.manager = manager
	}

	public start() {
		var file = this.manager.grabFile()
		if (file === undefined) {
			this.uploading = false
			console.debug("No files left in queue")
			return // Stop the thread
		}
		
		this.uploading = true
		this.tries = 0
		this.upload(<FileUpload>file)
	}
	public startIfInactive(){
		if (!this.uploading) {
			this.start()
		}
	}

	private upload(file: FileUpload){
		console.debug("Starting upload of " + file.file.name)

		var formData = new FormData()
		formData.append('file', file.file)
		formData.append("name", file.file.name)

		var that = this // jquery changes the definiton of "this"

		$.ajax({
			url: "/api/file",
			data: formData,
			cache: false,
			crossDomain: false,
			contentType: false,
			processData: false,
			type: 'POST',
			xhr: function () {
				var xhr = new XMLHttpRequest();
				xhr.upload.addEventListener("progress", function (evt) {
					if (evt.lengthComputable) {
						file.onProgress(evt.loaded / evt.total)
					}
				}, false);
				return xhr;
			},
			success: function (data) {
				file.onFinished(data.id)
				console.log("Done: " + data.id)
				that.setHistoryCookie(data.id)

				that.start() // Continue uploading on this thread
			},
			error: function (xhr, status, error){
				console.log(status)
				console.log(error)

				if (that.tries === 3) {
					alert("Upload failed: " + status);
					that.uploading = false
					file.onFailure(status, error)

					that.start() // Try to continue
					return; // Upload failed
				}

				// Try again
				that.tries++
				that.upload(file)
			}
		});
	}

	private setHistoryCookie(id: string){
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
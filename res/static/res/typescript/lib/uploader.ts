declare var apiEndpoint: string;

interface FileUpload {
	file: Blob
	name: string
	onProgress(progress: number)
	onFinished(id: string)
	onFailure(response: JQuery.Ajax.ErrorTextStatus, error: string)
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
	public start(){
		if (!this.uploading) {
			this.newFile()
		}
	}

	private newFile() {
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

	private upload(file: FileUpload){
		console.debug("Starting upload of " + file.name)

		var formData = new FormData()
		formData.append('file', file.file)
		formData.append("name", file.name)

		var that = this // jquery changes the definiton of "this"

		$.ajax({
			type: 'POST',
			url: apiEndpoint+"/file",
			data: formData,
			timeout: 7200000, // 2 hours
			cache: false,
			async: true,
			crossDomain: false,
			contentType: false,
			processData: false,
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
				that.setHistoryCookie(data.id)
				console.log("Done: " + data.id)

				that.newFile() // Continue uploading on this thread
			},
			error: function (xhr, status, error){
				console.log("status: "+status+" error: "+error)

				if (that.tries === 3) {
					alert("Upload failed: " + status);
					file.onFailure(status, error)

					setTimeout(function(){that.newFile()}, 2000) // Try to continue
					return; // Upload failed
				}

				// Try again
				that.tries++
				setTimeout(function(){that.upload(file)}, that.tries*3000)
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


class UploadManager {
	private uploadQueue:   Array<File>         = new Array();
	private uploadThreads: Array<UploadWorker> = new Array();
	private maxThreads:    4;

	public uploadFile(file: File) {
		console.debug("Adding upload to queue")
		this.uploadQueue.push(file);

		if (this.uploadThreads.length < 4) {
			console.debug("Starting upload thread")
			setTimeout(new UploadWorker(this).start(), 0) // Start a new upload thread
		}
	}
	public uploadFileList(files: FileList) {
		for (var i = 0; i < files.length; i++) {
			this.uploadFile(files.item(i))
		}
	}
	public grabFile(): File | undefined {
		if (this.uploadQueue.length > 0) {
			return this.uploadQueue.pop()
		} else {
			return undefined
		}
	}
}

class UploadWorker {
	private manager: UploadManager
	private tries: number

	constructor(manager: UploadManager) {
		this.manager = manager
	}

	public start() {
		var file = this.manager.grabFile()
		if (file === null) {
			console.debug("No file")
			return // Stop the thread
		}

		this.tries = 0
		this.upload(<File>file)
	}

	private upload(file: File){
		console.debug("Starting upload of " + file.name)

		var formData = new FormData()
		formData.append('file', file)
		formData.append("name", file.name)

		$.ajax({
			url: "/api/file",
			data: formData,
			cache: false,
			crossDomain: false,
			contentType: false,
			processData: false,
			type: 'POST',
			success: function (data) {
				console.log("Done: " + data.id)
				this.setHistoryCookie(data.id)
			},
			error: function (xhr, status, error){
				console.log(status)
				console.log(error)

				if (this.tries === 3) {
					alert("Upload failed: " + status);
					return; // Upload failed
				}

				// Try again
				this.tries++
				this.upload(file)
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
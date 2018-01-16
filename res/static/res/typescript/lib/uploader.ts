class UploadManager {
	private uploadQueue:   Array<File>;
	private uploadThreads: Array<UploadWorker>;
	private maxThreads:    4;

	public uploadFile(file: File) {
		this.uploadQueue.push(file);

		if (this.uploadThreads.length < 4) {
			setTimeout(new UploadWorker(this), 0) // Start a new upload thread
		}
	}
	public grabFile(): File | null {
		return null
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
			return // Stop the thread
		}

		this.tries = 0
		this.upload(file)
	}

	private upload(file: File){
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
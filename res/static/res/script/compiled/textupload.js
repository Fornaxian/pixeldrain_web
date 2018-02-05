var uploader = null;
var TextUpload = /** @class */ (function () {
    function TextUpload(file, name) {
        this.file = file;
        this.name = name;
    }
    TextUpload.prototype.onProgress = function (progress) { return; };
    TextUpload.prototype.onFinished = function (id) {
        setTimeout(window.location.href = "/u/" + id, 100);
    };
    TextUpload.prototype.onFailure = function (response, error) {
        alert("File upload failed! The server told us this: " + response);
    };
    return TextUpload;
}());
function uploadText() {
    var text = $("#textarea").val();
    var blob = new Blob([text], { type: "text/plain" });
    var filename = prompt("What do you want to call this piece of textual art?\n\n"
        + "Please add your own file extension, if you want.", "Pixeldrain_Text_File.txt");
    if (filename === null) {
        return;
    }
    if (uploader === null) {
        uploader = new UploadManager();
    }
    uploader.uploadFile(new TextUpload(blob, filename));
}
/**
 * Prevent the Tab key from moving the cursor outside of the text area
 */
$(document).delegate('#textarea', 'keydown', function (e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 9) {
        e.preventDefault();
        var start = $(this).get(0).selectionStart;
        var end = $(this).get(0).selectionEnd;
        // set textarea value to: text before caret + tab + text after caret
        $(this).val($(this).val().substring(0, start)
            + "\t"
            + $(this).val().substring(end));
        // put caret at right position again
        $(this).get(0).selectionStart =
            $(this).get(0).selectionEnd = start + 1;
    }
});
// Upload the file when ctrl + s is pressed
$(document).bind('keydown', function (e) {
    if (e.ctrlKey && (e.which === 83)) {
        e.preventDefault();
        uploadText();
        return false;
    }
});
var Cookie;
(function (Cookie) {
    function read(name) {
        var result = new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)').exec(document.cookie);
        return result ? result[1] : null;
    }
    Cookie.read = read;
    function write(name, value, days) {
        if (!days) {
            days = 365 * 20;
        }
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + value + expires + "; path=/";
    }
    Cookie.write = write;
    function remove(name) {
        write(name, "", -1);
    }
    Cookie.remove = remove;
})(Cookie || (Cookie = {}));
var UploadManager = /** @class */ (function () {
    function UploadManager() {
        this.uploadQueue = new Array();
        this.uploadThreads = new Array();
        this.maxThreads = 3;
    }
    UploadManager.prototype.uploadFile = function (file) {
        console.debug("Adding upload to queue");
        this.uploadQueue.push(file);
        if (this.uploadThreads.length < this.maxThreads) {
            console.debug("Starting upload thread");
            var thread_1 = new UploadWorker(this);
            this.uploadThreads.push(thread_1);
            setTimeout(function () { thread_1.start(); }, 0); // Start a new upload thread
        }
        else {
            for (var i = 0; i < this.uploadThreads.length; i++) {
                this.uploadThreads[i].start();
            }
        }
    };
    UploadManager.prototype.grabFile = function () {
        if (this.uploadQueue.length > 0) {
            return this.uploadQueue.shift();
        }
        else {
            return undefined;
        }
    };
    return UploadManager;
}());
var UploadWorker = /** @class */ (function () {
    function UploadWorker(manager) {
        this.tries = 0;
        this.uploading = false;
        this.manager = manager;
    }
    UploadWorker.prototype.start = function () {
        if (!this.uploading) {
            this.newFile();
        }
    };
    UploadWorker.prototype.newFile = function () {
        var file = this.manager.grabFile();
        if (file === undefined) {
            this.uploading = false;
            console.debug("No files left in queue");
            return; // Stop the thread
        }
        this.uploading = true;
        this.tries = 0;
        this.upload(file);
    };
    UploadWorker.prototype.upload = function (file) {
        console.debug("Starting upload of " + file.name);
        var formData = new FormData();
        formData.append('file', file.file);
        formData.append("name", file.name);
        var that = this; // jquery changes the definiton of "this"
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
                        file.onProgress(evt.loaded / evt.total);
                    }
                }, false);
                return xhr;
            },
            success: function (data) {
                file.onFinished(data.id);
                that.setHistoryCookie(data.id);
                console.log("Done: " + data.id);
                that.newFile(); // Continue uploading on this thread
            },
            error: function (xhr, status, error) {
                console.log("status: " + status + " error: " + error);
                if (that.tries === 3) {
                    alert("Upload failed: " + status);
                    file.onFailure(status, error);
                    setTimeout(function () { that.newFile(); }, 2000); // Try to continue
                    return; // Upload failed
                }
                // Try again
                that.tries++;
                setTimeout(function () { that.upload(file); }, that.tries * 3000);
            }
        });
    };
    UploadWorker.prototype.setHistoryCookie = function (id) {
        var uc = Cookie.read("pduploads");
        // First upload in this browser
        if (uc === null) {
            Cookie.write("pduploads", id + ".", undefined);
            return;
        }
        if (uc.length > 2000) {
            // Cookie is becoming too long, drop the oldest two files
            uc = uc.substring(uc.indexOf(".") + 1).substring(uc.indexOf(".") + 1);
        }
        Cookie.write("pduploads", uc + id + ".", undefined);
    };
    return UploadWorker;
}());

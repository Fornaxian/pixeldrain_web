"use strict";
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
    }
    UploadManager.prototype.uploadFile = function (file) {
        console.debug("Adding upload to queue");
        this.uploadQueue.push(file);
        if (this.uploadThreads.length < 4) {
            console.debug("Starting upload thread");
            setTimeout(new UploadWorker(this).start(), 0); // Start a new upload thread
        }
    };
    UploadManager.prototype.uploadFileList = function (files) {
        for (var i = 0; i < files.length; i++) {
            this.uploadFile(files.item(i));
        }
    };
    UploadManager.prototype.grabFile = function () {
        if (this.uploadQueue.length > 0) {
            return this.uploadQueue.pop();
        }
        else {
            return undefined;
        }
    };
    return UploadManager;
}());
var UploadWorker = /** @class */ (function () {
    function UploadWorker(manager) {
        this.manager = manager;
    }
    UploadWorker.prototype.start = function () {
        var file = this.manager.grabFile();
        if (file === null) {
            console.debug("No file");
            return; // Stop the thread
        }
        this.tries = 0;
        this.upload(file);
    };
    UploadWorker.prototype.upload = function (file) {
        console.debug("Starting upload of " + file.name);
        var formData = new FormData();
        formData.append('file', file);
        formData.append("name", file.name);
        $.ajax({
            url: "/api/file",
            data: formData,
            cache: false,
            crossDomain: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function (data) {
                console.log("Done: " + data.id);
                this.setHistoryCookie(data.id);
            },
            error: function (xhr, status, error) {
                console.log(status);
                console.log(error);
                if (this.tries === 3) {
                    alert("Upload failed: " + status);
                    return; // Upload failed
                }
                // Try again
                this.tries++;
                this.upload(file);
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

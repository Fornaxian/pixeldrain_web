package webcontroller

import (
	"net/http"
	"sort"
	"strings"

	"fornaxian.tech/pixeldrain_server/api/restapi/apitype"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

type filesystemPath struct {
	Path     []filesystemNode
	Children []filesystemNode
}

type filesystemNode struct {
	HREF     string
	Icon     string
	Name     string
	Type     string
	FileSize int64
	FileType string
}

func convFilesystemNode(bucketID string, v apitype.FilesystemNode) (node filesystemNode) {
	node = filesystemNode{
		HREF:     "/fs/" + bucketID + v.Path,
		Type:     v.Type,
		Name:     v.Name,
		FileSize: v.FileSize,
		FileType: v.FileType,
	}
	if node.Type == "dir" {
		node.Icon = "/res/img/mime/folder.png"
	} else {
		node.Icon = "/res/img/mime/empty.png"
	}

	return node
}

func (wc *WebController) serveFilesystem(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	var err error
	var td = wc.newTemplateData(w, r)
	var path = strings.TrimPrefix(p.ByName("path"), "/")
	var fsPath filesystemPath

	if path == "" {
		buckets, err := td.PixelAPI.GetFilesystemBuckets()
		if err != nil {
			if err.Error() == "not_found" {
				wc.templates.Get().ExecuteTemplate(w, "404", td)
			} else if err.Error() == "authentication_required" {
				http.Redirect(w, r, "/login", http.StatusSeeOther)
			} else {
				log.Error("Failed to get buckets: %s", err)
				wc.templates.Get().ExecuteTemplate(w, "500", td)
			}
			return
		}

		for _, v := range buckets.Buckets {
			fsPath.Children = append(fsPath.Children, filesystemNode{
				HREF:     "/fs/" + v.ID,
				Icon:     "/res/img/mime/folder-remote.png",
				Type:     "dir",
				Name:     v.Name,
				FileSize: 0,
				FileType: "inode/directory",
			})
		}
	} else {
		log.Info("getting path %s", path)
		node, err := td.PixelAPI.GetFilesystemPath(path)
		if err != nil {
			if err.Error() == "not_found" || err.Error() == "path_not_found" {
				wc.templates.Get().ExecuteTemplate(w, "404", td)
			} else {
				log.Error("Failed to get path: %s", err)
				wc.templates.Get().ExecuteTemplate(w, "500", td)
			}
			return
		}

		if node.Path[node.NodeIndex].Type == "file" {
			http.Redirect(w, r, "/api/filesystem/"+path, http.StatusSeeOther)
			return
		}

		for _, v := range node.Path {
			fsPath.Path = append(fsPath.Path, convFilesystemNode(node.Bucket.ID, v))
		}
		for _, v := range node.Children {
			fsPath.Children = append(fsPath.Children, convFilesystemNode(node.Bucket.ID, v))
		}
	}

	sort.Slice(fsPath.Children, func(i, j int) (less bool) {
		// Directories always come first. Make sure we're comparing apples with
		// apples
		if fsPath.Children[i].Type != fsPath.Children[j].Type {
			return fsPath.Children[i].Type == "dir"
		}

		return fsPath.Children[i].Name < fsPath.Children[j].Name
	})

	td.Title = "Filesystem"
	td.Other = fsPath
	err = wc.templates.Get().ExecuteTemplate(w, "filesystem", td)
	if err != nil && !strings.Contains(err.Error(), "broken pipe") {
		log.Error("Error executing template filesystem: %s", err)
	}
}

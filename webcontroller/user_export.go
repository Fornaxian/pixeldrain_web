package webcontroller

import (
	"io"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func writeCSVLine(w io.Writer, fields ...interface{}) {
	for i, field := range fields {
		if i != 0 {
			w.Write([]byte(","))
		}

		switch val := field.(type) {
		case string:
			// In CSV files quotes are escaped by replacing them with double quotes
			w.Write([]byte(`"` + strings.ReplaceAll(val, `"`, `""`) + `"`))
		case int:
			w.Write([]byte(strconv.Itoa(val)))
		case int64:
			w.Write([]byte(strconv.FormatInt(val, 10)))
		case time.Time:
			w.Write([]byte(`"` + val.Format(time.RFC3339) + `"`))
		default:
			panic("unknown CSV field type")
		}
	}
	w.Write([]byte("\n"))
}

func (wc *WebController) serveUserExportFiles(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	td := wc.newTemplateData(w, r)
	if !td.Authenticated {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	files, err := td.PixelAPI.GetUserFiles()
	if err != nil {
		log.Error("Failed to get user files: %s", err)
		return
	}

	sort.Slice(files.Files, func(i, j int) (less bool) {
		return files.Files[i].DateUpload.Before(files.Files[j].DateUpload)
	})

	w.Header().Add("Content-Description", "File Transfer")
	w.Header().Add("Content-Disposition", `attachment; filename=pixeldrain_user_files.csv`)
	w.Header().Add("Content-Type", "text/csv")
	w.Header().Add("Transfer-Encoding", "chunked") // Replacement for Content-Length

	writeCSVLine(
		w, "id", "name", "size", "type", "date_upload", "date_last_view",
		"views", "downloads", "bandwidth_used",
	)
	for _, file := range files.Files {
		writeCSVLine(
			w, file.ID, file.Name, file.Size, file.MimeType, file.DateUpload,
			file.DateLastView, file.Views, file.Downloads, file.BandwidthUsed,
		)
	}
}

func (wc *WebController) serveUserExportLists(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	td := wc.newTemplateData(w, r)
	if !td.Authenticated {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	lists, err := td.PixelAPI.GetUserLists()
	if err != nil {
		log.Error("Failed to get user lists: %s", err)
		return
	}

	sort.Slice(lists.Lists, func(i, j int) (less bool) {
		return lists.Lists[i].DateCreated.Before(lists.Lists[j].DateCreated)
	})

	w.Header().Add("Content-Description", "File Transfer")
	w.Header().Add("Content-Disposition", `attachment; filename=pixeldrain_user_lists.csv`)
	w.Header().Add("Content-Type", "text/csv")
	w.Header().Add("Transfer-Encoding", "chunked") // Replacement for Content-Length

	writeCSVLine(w, "id", "title", "date_created", "file_count")
	for _, list := range lists.Lists {
		writeCSVLine(w, list.ID, list.Title, list.DateCreated, list.FileCount)
	}
}

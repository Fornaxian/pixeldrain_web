module fornaxian.tech/pixeldrain_web

go 1.17

replace (
	fornaxian.tech/pixeldrain_api_client => ../pixeldrain_api_client
	fornaxian.tech/pixeldrain_server/util => ../pixeldrain_server/util
)

require (
	fornaxian.tech/pixeldrain_api_client v0.0.0-00010101000000-000000000000
	fornaxian.tech/pixeldrain_server/util v0.0.0-00010101000000-000000000000
	github.com/BurntSushi/toml v0.4.1 // indirect
	github.com/Fornaxian/config v0.0.0-20180915150834-ac41cf746a70
	github.com/Fornaxian/log v0.0.0-20190617093801-1c7ce9a7c9b3
	github.com/aymerick/douceur v0.2.0 // indirect
	github.com/gocql/gocql v0.0.0-20211015133455-b225f9b53fa1 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/gorilla/css v1.0.0 // indirect
	github.com/hailocab/go-hostpool v0.0.0-20160125115350-e80d13ce29ed // indirect
	github.com/julienschmidt/httprouter v1.3.0
	github.com/microcosm-cc/bluemonday v1.0.16
	github.com/russross/blackfriday/v2 v2.1.0
	golang.org/x/crypto v0.0.0-20210921155107-089bfa567519 // indirect
	golang.org/x/net v0.0.0-20211101193420-4a448f8816b3 // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
)

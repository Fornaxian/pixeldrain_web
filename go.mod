module fornaxian.tech/pixeldrain_web

go 1.18

replace fornaxian.tech/pixeldrain_api_client => ../pixeldrain_api_client

require (
	fornaxian.tech/config v0.0.0-20211108212237-6133aed90586
	fornaxian.tech/log v0.0.0-20211102185326-552e9b1f8640
	fornaxian.tech/pixeldrain_api_client v0.0.0-20221207191816-6872676df741
	fornaxian.tech/util v0.0.0-20230520114728-bd827686fec7
	github.com/julienschmidt/httprouter v1.3.0
	github.com/microcosm-cc/bluemonday v1.0.24
	github.com/russross/blackfriday/v2 v2.1.0
)

require (
	github.com/BurntSushi/toml v1.3.0 // indirect
	github.com/aymerick/douceur v0.2.0 // indirect
	github.com/gocql/gocql v1.4.0 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/gorilla/css v1.0.0 // indirect
	github.com/hailocab/go-hostpool v0.0.0-20160125115350-e80d13ce29ed // indirect
	golang.org/x/crypto v0.9.0 // indirect
	golang.org/x/net v0.10.0 // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
)

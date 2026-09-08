module fornaxian.tech/pixeldrain_web

go 1.26.0

replace (
	fornaxian.tech/pixeldrain_api_client => ../pixeldrain_api_client
	fornaxian.tech/util => ../util
)

require (
	fornaxian.tech/config v0.0.0-20211108212237-6133aed90586
	fornaxian.tech/log v0.0.0-20211102185326-552e9b1f8640
	fornaxian.tech/pixeldrain_api_client v0.0.0-20260124133150-a94861b84e11
	fornaxian.tech/util v0.0.0-20260123171803-02d15be63d16
	github.com/julienschmidt/httprouter v1.3.0
	github.com/microcosm-cc/bluemonday v1.0.27
	github.com/russross/blackfriday/v2 v2.1.0
)

require (
	github.com/BurntSushi/toml v1.6.0 // indirect
	github.com/apache/cassandra-gocql-driver/v2 v2.1.1 // indirect
	github.com/aymerick/douceur v0.2.0 // indirect
	github.com/golang/snappy v1.0.0 // indirect
	github.com/gorilla/css v1.0.1 // indirect
	golang.org/x/crypto v0.51.0 // indirect
	golang.org/x/net v0.54.0 // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
)

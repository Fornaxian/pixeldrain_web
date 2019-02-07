run:
	${MAKE} -j2 backgroundrun backgroundts
build:
	tsc res/static/typescript/lib/*.ts --outFile res/static/script/pixellib.js \
	    res/static/typescript/home/*.ts \
	    res/static/typescript/lib/*.ts --outFile res/static/script/home.js
	go build main.go -o pixeldrain-web

deps:
	npm install -g typescript

backgroundrun:
	go run main.go
backgroundts:
	tsc --watch --project res/static/typescript/home
	            --project res/static/typescript/textupload

docker:
	go build -o docker/pixeldrain-web docker/main.go
	chmod +x docker/pixeldrain-web
	docker build --tag pixeldrain-web -f docker/Dockerfile .
	rm docker/pixeldrain-web

.PHONY: docker

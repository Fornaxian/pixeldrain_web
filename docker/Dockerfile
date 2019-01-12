FROM ubuntu

RUN mkdir -p \
	/bin \
	/opt/pixeldrain/res

COPY docker/pixeldrain-web /bin/pixeldrain-web
COPY res /opt/pixeldrain/res

EXPOSE 8081

ENV api_url_external="" \
	api_url_internal="" \
	debug_mode=""

ENTRYPOINT [ "/bin/pixeldrain-web" ]

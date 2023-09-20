export default api => {
	api.cache(true);
	return {
		presets: [
			[
				"@babel/env",
				{
					"targets": {
						"firefox": "52",
						"esmodules": true,
					}
				}
			]
		]
	};
}

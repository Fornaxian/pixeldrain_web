package pixelapi

type PixelAPI struct {
	apiEndpoint string
}

func New(apiEndpoint string) *PixelAPI {
	return &PixelAPI{apiEndpoint}
}


type VideoPositions = {
	[key: string]: VideoPosition
}

export type VideoPosition = {
	time: number
	pos: number
	dur: number
}

const storage_key = "video_positions"
const expiry_time = 28 * 24 * 60 * 60 * 1000

let position_cache: VideoPositions | null = null
export const get_video_positions = () => {
	if (position_cache !== null) {
		return position_cache
	}

	let video_positions = JSON.parse(window.localStorage.getItem(storage_key)) as VideoPositions
	if (video_positions === null) {
		return {} as VideoPositions
	}
	return video_positions
}

export const save_video_position = (id: string, position: number, duration: number) => {
	if (duration < 300) {
		return // Don't bother saving videos less than 5 minutes long
	}

	const video_positions = get_video_positions()

	// Add our new entry
	video_positions[id] = {
		time: (new Date).getTime(),
		pos: position,
		dur: duration,
	}

	// Remove old entries
	const expiry_thresh = (new Date).getTime() - expiry_time
	for (const key in video_positions) {
		if (video_positions[key].time < expiry_thresh) {
			delete video_positions[key]
			console.debug("Delete old video position", key)
		}
	}

	// Save updated object
	window.localStorage.setItem(storage_key, JSON.stringify(video_positions))

	// Update the cache
	position_cache = video_positions
}

export const get_video_position = (id: string) => {
	const video_positions = get_video_positions()
	if (video_positions[id] === undefined) {
		return null
	}
	return video_positions[id]
}

export const video_position = (node: HTMLVideoElement, get_id: () => string) => {
	let last_time = 0

	const loadeddata = (e: Event) => {
		last_time = 0

		const vp = get_video_position(get_id())
		if (vp === null || vp.pos === 0 || vp.dur === 0) {
			return
		} else if (vp.pos / vp.dur > 0.95) {
			// If the video is more than 95% complete we don't do anything
			console.debug("Video is at end, not setting time")
			return
		}

		(e.target as HTMLVideoElement).currentTime = vp.pos
		last_time = vp.pos
	}

	const timeupdate = (e: Event) => {
		const vid = (e.target as HTMLVideoElement)

		// If the current timestamp is more than ten seconds off the last
		// timestamp we saved, then we save the new timestamp
		if (Math.abs(vid.currentTime - last_time) > 10) {
			save_video_position(get_id(), vid.currentTime, vid.duration)
			last_time = vid.currentTime
		}
	}

	node.addEventListener("loadeddata", loadeddata)
	node.addEventListener("timeupdate", timeupdate)

	return {
		destroy() {
			node.removeEventListener("loadeddata", loadeddata)
			node.removeEventListener("timeupdate", timeupdate)
		}
	}
}

export type FileEvent = {
	index: number,
	action: FileAction,
	original: MouseEvent,
}
export enum FileAction { Click, Context, Edit, Share, Branding, Select, Download }

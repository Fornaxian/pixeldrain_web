import { writable } from "svelte/store";
import { get_user, type Subscription, type User } from "./PixeldrainAPI";

export const user = writable(
	{ subscription: {} as Subscription } as User,
	(set: (value: User) => void) => {
		get_user().then((u: User) => {
			set(u)
		}).catch((err: any) => {
			alert("Could not fetch user:\n" + JSON.stringify(err))
		})
	}
)

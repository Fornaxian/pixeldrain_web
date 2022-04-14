<script>
import { onMount, tick } from "svelte";
import Modal from "../util/Modal.svelte";

let modal

const close = () => {
	localStorage.setItem("ukraine_modal_dismissed", "🇺🇦")
	modal.hide()
}
onMount(async () => {
	if (localStorage.getItem("ukraine_modal_dismissed") === "🇺🇦") {
		return
	}

	let country = localStorage.getItem("country_code")
	if (country === null) {
		try {
			const resp = await fetch(window.api_endpoint+"/misc/geo_ip")
			if(resp.status >= 400) {
				throw new Error(await resp.text())
			}
			country = (await resp.json()).country.iso_code;
			localStorage.setItem("country_code", country)
		} catch (err) {
			console.log("Failed to get geo IP data: ", err)
			return
		}
	}

	if (country === "RU" || country === "BY") {
		modal.show()
		await tick()
		resize()
	}
})

let video
const resize = () => {
	video.style.height = (video.clientWidth*0.56)+"px"
}

let language = "RU"
</script>

<svelte:window on:resize={resize} />

<Modal bind:this={modal} title="Vladimir Putin is lying to you!" width="1000px">
	<iframe bind:this={video}
		style="width: 100%; height: 562px;"
		src="https://www.youtube-nocookie.com/embed/Y0IobS_JDww?start=1996"
		title="YouTube video player"
		frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
		allowfullscreen
	>
	</iframe>
	<br/>

	{#if language === "EN"}
		<div style="text-align: center; font-size: 1.4em;">
			<a href="https://www.youtube.com/watch?v=Y0IobS_JDww&t=1996s" class="button" target="_blank">
				<i class="icon">play_circle</i>
				Watch on YouTube
			</a>
			<a href="https://pixeldrain.com/u/JZ9D7RFC" class="button" target="_blank">
				<i class="icon">play_circle</i>
				Watch on Pixeldrain
			</a>
		</div>
		<div class="indent">
			<p>
				An independent news agency asked me to show this video to my
				Russian visitors. The goal is to prevent the spread of
				misinformation. Russian news agencies are spreading propaganda,
				they cannot be trusted.
			</p>
			<p>
				Ukraine is not governed by nazis. The Ukrainian parliament and
				president were democratically elected. It is a peaceful nation.
			</p>
			<p>
				The Russian army is bombing cities and committing genocide
				across the country. Thousands of civilians have been brutally
				murdered. This has to stop as soon as possible.
			</p>
		</div>
	{:else if language === "RU"}
		<div style="text-align: center; font-size: 1.4em;">
			<a href="https://www.youtube.com/watch?v=Y0IobS_JDww&t=1996s" class="button" target="_blank">
				<i class="icon">play_circle</i>
				Смотреть на YouTube
			</a>
			<a href="https://pixeldrain.com/u/JZ9D7RFC" class="button" target="_blank">
				<i class="icon">play_circle</i>
				Смотреть на Pixeldrain
			</a>
		</div>
		<div class="indent">
			<p>
				Независимое информационное агентство попросило меня показать это
				видео моим российским посетителям. Цель состоит в том, чтобы
				предотвратить распространение дезинформации. Российские
				информационные агентства распространяют пропаганду, им нельзя
				доверять.
			</p>
			<p>
				Украина не управляется нацистами. Украинский парламент и
				президент были избраны демократическим путем. Это миролюбивая
				нация.
			</p>
			<p>
				Российская армия бомбит города и совершает геноцид через всю
				страну. Тысячи мирных жителей были зверски убиты. Это должно
				прекратиться как можно скорее.
			</p>
		</div>
	{/if}

	<button on:click={() => language = "RU"} class:button_highlight={language === "RU"} style="float: left; margin: 8px; margin-right: 0;">
		<i class="icon">translate</i> RU
	</button>
	<button on:click={() => language = "EN"} class:button_highlight={language === "EN"} style="float: left; margin: 8px;">
		<i class="icon">translate</i> EN
	</button>

	<button style="float: right; margin: 8px;" on:click={close}>
		<i class="icon">close</i>
		{#if language === "EN"}
			Don't show this again
		{:else if language === "RU"}
			Не показывать это снова
		{/if}
	</button>
</Modal>

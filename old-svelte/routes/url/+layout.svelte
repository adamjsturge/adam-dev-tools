<script>
	import { page } from '$app/stores';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<nav class="bg-ctp-surface1 p-4">
	{#if $page.url.pathname === '/url/encode'}
		<a href="/url/decode" class="text-ctp-text hover:text-ctp-subtext0">Go to Decode</a>
	{:else if $page.url.pathname === '/url/decode'}
		<a href="/url/encode" class="text-ctp-text hover:text-ctp-subtext0">Go to Encode</a>
	{/if}
</nav>

{@render children?.()}

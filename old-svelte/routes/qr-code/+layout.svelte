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
	<div class="flex flex-wrap gap-4 justify-center">
		{#if $page.url.pathname === '/qr-code'}
			<a href="/qr-code/scan" class="rounded bg-ctp-blue px-4 py-2 text-ctp-base hover:bg-ctp-sapphire focus:outline-none focus:ring-2 focus:ring-ctp-blue focus:ring-offset-2 focus:ring-offset-ctp-surface1">
				Go to Scanner
			</a>
		{:else if $page.url.pathname === '/qr-code/scan'}
			<a href="/qr-code" class="rounded bg-ctp-mauve px-4 py-2 text-ctp-base hover:bg-ctp-pink focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-2 focus:ring-offset-ctp-surface1">
				Go to Generator
			</a>
		{/if}
	</div>
</nav>

{@render children?.()}

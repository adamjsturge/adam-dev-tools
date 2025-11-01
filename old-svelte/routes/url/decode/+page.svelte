<svelte:head>
    <title>URL Decode - Dev Tools</title>
</svelte:head>

<script>
	import IOwithCopy from '$lib/IOwithCopy.svelte';

	/**
	 * @param {string} input
	 */
	function decodeUrl(input) {
		return decodeURIComponent(input);
	}
</script>

<IOwithCopy
	title="URL Decoder"
	inputPlaceholder="Enter string to decode"
	buttonText="Decode"
	onButtonClick={decodeUrl}
/>

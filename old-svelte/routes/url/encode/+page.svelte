<svelte:head>
    <title>URL Encode - Dev Tools</title>
</svelte:head>

<script>
	import IOwithCopy from '$lib/IOwithCopy.svelte';

	/**
	 * @param {string} input
	 */
	function encodeURL(input) {
		return encodeURIComponent(input);
	}
</script>

<IOwithCopy
	title="URL Encoder"
	inputPlaceholder="Enter string to encode"
	buttonText="Encode"
	onButtonClick={encodeURL}
/>

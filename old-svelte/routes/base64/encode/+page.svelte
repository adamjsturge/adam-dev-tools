<svelte:head>
    <title>Base64 Encode - Dev Tools</title>
</svelte:head>

<script>
	import Base64Layout from '$lib/IOwithCopy.svelte';

	/**
	 * @param {string} input
	 */
	function encodeBase64(input) {
		try {
			return btoa(input);
		} catch (e) {
			return 'Invalid input string';
		}
	}
</script>

<Base64Layout
	title="Base64 Encoder"
	inputPlaceholder="Enter string to encode"
	buttonText="Encode"
	onButtonClick={encodeBase64}
/>

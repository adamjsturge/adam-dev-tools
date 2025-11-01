<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/base64/encode');
	});
</script>

<p>Redirecting...</p>

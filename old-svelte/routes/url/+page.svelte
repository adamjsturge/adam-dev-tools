<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/url/encode');
	});
</script>

<p>Redirecting...</p>

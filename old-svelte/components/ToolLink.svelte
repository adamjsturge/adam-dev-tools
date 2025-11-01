<script lang="ts">
	export let href: string;
	export let title: string;
</script>

<a
	{href}
	class="block rounded-lg bg-ctp-surface0 p-6 text-center text-ctp-text shadow-md hover:bg-ctp-surface1 font-bold"
>
	{title}
</a>

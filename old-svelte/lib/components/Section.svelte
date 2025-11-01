<script>
    /** @type {string} */
    export let title;
    /** @type {string} */
    export let customClass = '';
</script>

<div class="w-[90%] max-w-4xl {customClass}">
    <h2 class="text-xl font-bold mb-4">{title}</h2>
    <slot />
</div>

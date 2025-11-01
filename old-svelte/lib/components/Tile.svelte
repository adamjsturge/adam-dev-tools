<script>
    /** @type {string} */
    export let title;
    /** @type {number} */
    export let value;
    /** @type {string} */
    export let customClass = '';
    /** @type {boolean} */
    export let highlight = false;
</script>

<div class="p-4 rounded-lg transition-colors duration-200 {highlight ? 'bg-ctp-surface2' : 'bg-ctp-surface0'} {customClass}">
    <h3 class="font-bold mb-2">{title}</h3>
    <p>{(value * 100).toFixed(2)}%</p>
</div>

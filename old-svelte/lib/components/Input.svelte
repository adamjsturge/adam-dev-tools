<script>
    /** @type {string|undefined} */
    export let id = undefined;
    /** @type {string} */
    export let label;
    /** @type {number|string} */
    export let value;
    /** @type {number|string} */
    export let min = 1;
    /** @type {number|string|undefined} */
    export let max = undefined;
    /** @type {string} */
    export let type = 'number';
    /** @type {string} */
    export let placeholder = '';
    /** @type {string} */
    export let customClass = '';
    /** @type {((event: Event) => void)|undefined} */
    export let oninput = undefined;
</script>

<div class="flex flex-col {customClass}">
    <label class="mb-2" for={id}>{label}</label>
    <input
        {id}
        {type}
        {value}
        {min}
        {max}
        {placeholder}
        {oninput}
        class="p-2 border rounded-lg"
    />
</div>

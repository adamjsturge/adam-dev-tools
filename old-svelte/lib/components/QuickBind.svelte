<script>
    /**
     * Array of preset configurations
     * @typedef {{label: string, values: Object.<string, number|function>}} Preset
     * @type {Preset[]}
     */
    export let presets;

    /**
     * Default values for the bindings
     * @type {Object.<string, number>}
     */
    export let defaultValues;

    /**
     * Current binding values to be modified
     * @type {Object.<string, number>}
     */
    export let bindings;

    /**
     * Event handler for preset updates
     * @type {(updates: Object.<string, number>) => void}
     */
    export let onUpdate;

    /**
     * Apply a preset configuration to the bindings
     * @param {Preset} preset The preset configuration to apply
     */
    function applyPreset(preset) {
        /** @type {Object.<string, number>} */
        const updates = {};
        for (const [key, value] of Object.entries(preset.values)) {
            if (key in bindings) {
                updates[key] = typeof value === 'function' 
                    ? value(defaultValues[key])
                    : value;
            }
        }
        /** @type {(updates: { [key: string]: number }) => void} */
        onUpdate?.(updates);
    }
</script>

<div class="flex gap-2 flex-wrap">
    {#each presets as preset}
        <button
            class="px-3 py-1 text-sm font-medium text-ctp-base bg-ctp-blue rounded-md hover:bg-ctp-sapphire"
            on:click={() => applyPreset(preset)}
        >
            {preset.label}
        </button>
    {/each}
</div>

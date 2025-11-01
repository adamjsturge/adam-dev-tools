<script lang="ts">
    export let quality: number;
    export let appendQuality: boolean;
</script>

<div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
        <label class="flex flex-col">
            <span class="text-sm font-medium">Quality: {Math.round(quality * 100)}%</span>
            <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.1" 
                bind:value={quality}
                class="w-full accent-ctp-mauve"
            >
        </label>
    </div>

    <label class="flex items-center gap-2">
        <input 
            type="checkbox" 
            bind:checked={appendQuality}
            class="accent-ctp-mauve"
        >
        <span class="text-sm">Append quality to filename</span>
    </label>
</div>

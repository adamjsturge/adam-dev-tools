<script lang="ts">
    export let files: FileList | undefined;
</script>

<div class="w-full">
    <input 
        type="file" 
        accept="image/*" 
        multiple 
        bind:files
        class="w-full p-2 border border-ctp-surface2 rounded-lg file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0 file:bg-ctp-surface0 file:text-ctp-text
               hover:file:bg-ctp-surface1"
    >
</div>

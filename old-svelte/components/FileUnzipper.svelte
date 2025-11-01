<script>
    import JSZip from 'jszip';

    /** @type {function(CustomEvent): void} */
    export let onExtracted = () => {};
    
    /** @type {string} */
    export let acceptedTypes = '.zip';
    
    /** @type {string} */
    export let dropZoneClass = 'border-2 border-dashed border-gray-300 rounded-lg p-8 text-center';
    
    /** @type {File|null} */
    let selectedFile = null;
    
    /** @type {boolean} */
    let isProcessing = false;
    
    /** @type {string} */
    let error = '';

    /** @type {HTMLInputElement|null} */
    let fileInput = null;

    /**
     * Handles file selection from input or drop
     * @param {File} file
     * @returns {Promise<void>}
     */
    async function handleFile(file) {
        if (!file) return;
        
        try {
            isProcessing = true;
            error = '';
            
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            /** @type {Array<{name: string, content: Blob}>} */
            const extractedFiles = [];

            for (const [filename, file] of Object.entries(contents.files)) {
                if (!file.dir) {
                    const blob = await file.async('blob');
                    extractedFiles.push({ name: filename, content: blob });
                }
            }

            onExtracted(new CustomEvent('extracted', { detail: extractedFiles }));
        } catch (err) {
            error = 'Failed to process zip file: ' + (err instanceof Error ? err.message : String(err));
        } finally {
            isProcessing = false;
        }
    }

    /**
     * Handles file drop event
     * @param {DragEvent} event
     */
    function handleDrop(event) {
        event.preventDefault();
        const file = event.dataTransfer?.files[0];
        if (file) handleFile(file);
    }

    /**
     * Handle keyboard events for the drop zone
     * @param {KeyboardEvent} event
     */
    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInput?.click();
        }
    }
</script>

<div
    class={dropZoneClass}
    on:dragover|preventDefault
    on:drop={handleDrop}
    role="button"
    tabindex="0"
    on:keydown={handleKeyDown}
    aria-label="File upload drop zone"
    data-testid="file-drop-zone"
    aria-describedby={error ? 'error-message' : undefined}
>
    <input
        type="file"
        accept={acceptedTypes}
        class="hidden"
        id="file-input"
        bind:this={fileInput}
        on:change={(e) => handleFile(e.target.files?.[0] || null)}
        aria-label="Choose zip file"
    />
    
    <label 
        for="file-input" 
        class="cursor-pointer block w-full h-full"
        aria-live="polite"
    >
        {#if isProcessing}
            <p class="text-gray-600" role="status">
                <span class="sr-only">Status:</span>
                Processing your file...
            </p>
        {:else}
            <p class="text-gray-600">
                <span class="sr-only">Instructions:</span>
                Drop a ZIP file here or click to select
            </p>
        {/if}
    </label>

    {#if error}
        <p 
            class="text-red-500 mt-2" 
            role="alert"
            id="error-message"
        >
            {error}
        </p>
    {/if}
</div>

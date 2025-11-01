<script lang="ts">
    import FileInput from '$lib/components/FileInput.svelte';
    import QualityControl from '$lib/components/QualityControl.svelte';

    let files: FileList;
    let quality = 1;
    let appendQuality = false;
    let converting = false;
    let progress = 0;
    let totalFiles = 0;

    async function convertToWebP() {
        if (!files || files.length === 0) return;
        
        converting = true;
        totalFiles = files.length;
        progress = 0;

        for (let file of files) {
            const img = new Image();
            const reader = new FileReader();

            await new Promise((resolve) => {
                reader.onload = function(e) {
                    img.src = e.target?.result as string;
                    img.onload = resolve;
                };
                reader.readAsDataURL(file);
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);

            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob(
                    (blob) => resolve(blob!),
                    'image/webp',
                    quality === 1 ? 1 - Number.EPSILON : quality // Bug with 1 making the size way too big
                );
            });

            const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
            const qualitySuffix = appendQuality ? `-q${Math.round(quality * 100)}` : '';
            const newFileName = `${originalName}${qualitySuffix}.webp`;

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = newFileName;
            link.click();
            URL.revokeObjectURL(link.href);

            progress++;
        }

        converting = false;
    }
</script>

<svelte:head>
    <title>WebP Converter - Dev Tools</title>
</svelte:head>

<div class="max-w-2xl mx-auto p-8">
    <h1 class="text-2xl font-bold text-ctp-text mb-6">WebP Converter</h1>
    
    <div class="flex flex-col gap-6">
        <FileInput bind:files />
        <QualityControl bind:quality bind:appendQuality />

        <button 
            on:click={convertToWebP} 
            disabled={!files || converting}
            class="px-4 py-2 bg-ctp-mauve text-ctp-base rounded-lg
                   hover:bg-ctp-pink disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
        >
            {#if converting}
                Converting... ({progress}/{totalFiles})
            {:else}
                Convert to WebP
            {/if}
        </button>
    </div>
</div>

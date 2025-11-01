<svelte:head>
    <title>Word Counter - Dev Tools</title>
</svelte:head>

<script>
    import TextArea from '$lib/components/TextArea.svelte';

    /** @type {string} */
    let text = '';

    /**
     * Calculate text statistics
     * @param {string} input - The text to analyze
     * @returns {{
     *   characters: number,
     *   charactersNoSpaces: number,
     *   words: number,
     *   lines: number,
     *   sentences: number,
     *   paragraphs: number
     * }}
     */
    function calculateStats(input) {
        return {
            characters: input.length,
            charactersNoSpaces: input.replace(/\s/g, '').length,
            words: input.trim() === '' ? 0 : input.trim().split(/\s+/).length,
            lines: input.split('\n').length,
            sentences: input.trim() === '' ? 0 : input.split(/[.!?]+/).filter(Boolean).length,
            paragraphs: input.trim() === '' ? 0 : input.split(/\n\s*\n/).filter(Boolean).length
        };
    }

    $: stats = calculateStats(text);
</script>

<main class="flex h-screen flex-col items-center p-4">
    <h1 class="mb-4 text-2xl font-bold">Ultimate Word Counter</h1>
    
    <div class="w-[90%] max-w-4xl">
        <TextArea
            bind:value={text}
            customClass="h-[40vh] w-full mb-4"
            placeholder="Start typing or paste your text here..."
        />
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="bg-ctp-surface0 p-4 rounded-lg">
                <h3 class="font-bold mb-2">Characters</h3>
                <p>{stats.characters}</p>
            </div>
            <div class="bg-ctp-surface0 p-4 rounded-lg">
                <h3 class="font-bold mb-2">Characters (no spaces)</h3>
                <p>{stats.charactersNoSpaces}</p>
            </div>
            <div class="bg-ctp-surface0 p-4 rounded-lg">
                <h3 class="font-bold mb-2">Words</h3>
                <p>{stats.words}</p>
            </div>
            <div class="bg-ctp-surface0 p-4 rounded-lg">
                <h3 class="font-bold mb-2">Lines</h3>
                <p>{stats.lines}</p>
            </div>
            <div class="bg-ctp-surface0 p-4 rounded-lg">
                <h3 class="font-bold mb-2">Sentences</h3>
                <p>{stats.sentences}</p>
            </div>
            <div class="bg-ctp-surface0 p-4 rounded-lg">
                <h3 class="font-bold mb-2">Paragraphs</h3>
                <p>{stats.paragraphs}</p>
            </div>
        </div>
    </div>
</main>

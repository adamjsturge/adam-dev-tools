<svelte:head>
    <title>Sim Code Converter - Dev Tools</title>
</svelte:head>

<script>
    import { onMount } from 'svelte';
    import TextArea from '$lib/components/TextArea.svelte';

    let content = $state('');
    const STORAGE_KEY = 'sim-code-converter-content';

    /** @type {import('$lib/components/TextArea.svelte').default} */
    let textArea;

    onMount(() => {
        const savedContent = localStorage.getItem(STORAGE_KEY);
        if (savedContent) {
            content = savedContent;
        }
        textArea?.focus();
    });

    function handleInput() {
        if (content === '') {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, content);
        }
    }

    function convertSimCodes() {
        // Split text into lines and process each line
        content = content
            .split('\n')
            .map(line => {
                const trimmedLine = line.trim();
                if (trimmedLine === '') return trimmedLine;
                
                // Match pattern: number + (x or space) + card code + optional text
                const match = trimmedLine.match(/^(\d+)(x|\s)([^\s]+)/);
                if (match) {
                    const quantity = match[1];
                    const cardCode = match[3];
                    return `${quantity}x${cardCode}`;
                }
                
                // If no match, return the original line
                return line;
            })
            .join('\n');
        
        // Update localStorage
        localStorage.setItem(STORAGE_KEY, content);
    }
</script>

<main class="flex h-screen flex-col items-center p-4">
    <h1 class="mb-4 text-2xl font-bold">Sim Code Converter</h1>
    <div class="mb-4 w-[90%] flex justify-end">
        <button 
            class="px-4 py-2 bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire"
            on:click={convertSimCodes}
        >
            Convert to Standard Format
        </button>
    </div>
    <TextArea
        bind:this={textArea}
        bind:value={content}
        on:input={handleInput}
        customClass="h-[70vh] w-[90%]"
        autofocus
    />
</main> 
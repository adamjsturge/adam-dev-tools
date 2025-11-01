<svelte:head>
    <title>Extra Line Removal - Dev Tools</title>
</svelte:head>

<script>
    import { onMount } from 'svelte';
    import TextArea from '$lib/components/TextArea.svelte';

    let content = $state('');
    const STORAGE_KEY = 'extra-line-removal-content';

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

    function removeExtraLines() {
        // Split text into lines, filter out empty lines, and join back with newlines
        content = content
            .split('\n')
            .filter(line => line.trim() !== '')
            .join('\n');
        
        // Update localStorage
        localStorage.setItem(STORAGE_KEY, content);
    }
</script>

<main class="flex h-screen flex-col items-center p-4">
    <h1 class="mb-4 text-2xl font-bold">Extra Line Removal</h1>
    <div class="mb-4 w-[90%] flex justify-end">
        <button 
            class="px-4 py-2 bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire"
            on:click={removeExtraLines}
        >
            Remove Extra Lines
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
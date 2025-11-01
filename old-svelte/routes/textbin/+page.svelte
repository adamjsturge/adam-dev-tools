<svelte:head>
    <title>Text Bin - Dev Tools</title>
</svelte:head>

<script>
    import { onMount } from 'svelte';
    import TextArea from '$lib/components/TextArea.svelte';

    let content = $state('');
    const STORAGE_KEY = 'text-bin-content';

    /** @type {import('$lib/components/TextArea.svelte').default} */
    let textArea;

    onMount(() => {
        const savedContent = localStorage.getItem(STORAGE_KEY);
        if (savedContent) {
            content = savedContent;
        }
        textArea?.focus();
    });

    /**
     * @param {Event & { currentTarget: EventTarget & HTMLTextAreaElement; }} event
	 */
    function handleInput(event) {
        content = event.currentTarget.value;
        if (content === '') {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, content);
        }
    }
</script>

<main class="flex h-screen flex-col items-center p-4">
    <h1 class="mb-4 text-2xl font-bold">Text Bin</h1>
    <TextArea
        bind:this={textArea}
        bind:value={content}
        on:input={handleInput}
        customClass="h-[70vh] w-[90%]"
        autofocus
    />
</main>

<script>
    import TextArea from './components/TextArea.svelte';
	
    /**
     * @typedef {Object} Props
     * @property {string} [title]
     * @property {string} [inputPlaceholder]
     * @property {string} [buttonText]
     * @property {(arg0: string) => string} onButtonClick
     */

    /** @type {Props} */
    let {
        title = '',
        inputPlaceholder = '',
        buttonText = '',
        onButtonClick
    } = $props();
    let inputValue = $state('');
    let outputValue = $state('');

    function handleClick() {
        outputValue = onButtonClick(inputValue);
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(outputValue).then(() => {});
    }
</script>

<div class="flex flex-col items-center w-[90%] max-w-4xl mx-auto">
    <h1 class="mb-4 text-2xl font-bold">{title}</h1>
    
    <TextArea
        bind:value={inputValue}
        placeholder={inputPlaceholder}
        customClass="h-[35vh] w-full mb-4"
    />
    
    <button onclick={handleClick} class="mb-4 px-4 py-2 bg-ctp-surface0 rounded-lg hover:bg-ctp-surface1">
        {buttonText}
    </button>

    <TextArea
        value={outputValue}
        customClass="h-[35vh] w-full mb-4"
        placeholder="Output will appear here..."
    />
    
    <button onclick={copyToClipboard} class="px-4 py-2 bg-ctp-surface0 rounded-lg hover:bg-ctp-surface1">
        Copy Output
    </button>
</div>

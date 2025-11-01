<svelte:head>
    <title>Deckbuilder Links Generator - Dev Tools</title>
</svelte:head>

<script>
    import { onMount } from 'svelte';
    import TextArea from '$lib/components/TextArea.svelte';
    import Section from '$lib/components/Section.svelte';

    let content = $state('');
    let generatedLinks = $state({
        gumgum: '',
        egman: '',
        cardkaizoku: ''
    });

    const STORAGE_KEY = 'deckbuilder-links-content';

    /** @type {import('$lib/components/TextArea.svelte').default} */
    let textArea;

    onMount(() => {
        const savedContent = localStorage.getItem(STORAGE_KEY);
        if (savedContent) {
            content = savedContent;
            generateLinks();
        }
        textArea?.focus();
    });

    function handleInput() {
        if (content === '') {
            localStorage.removeItem(STORAGE_KEY);
            generatedLinks = { gumgum: '', egman: '', cardkaizoku: '' };
        } else {
            localStorage.setItem(STORAGE_KEY, content);
            generateLinks();
        }
    }

    /**
     * Parse sim deck list format and extract card codes with quantities
     * @returns {Array<{code: string, quantity: number}>}
     */
    function parseDecklist() {
        if (!content.trim()) return [];
        
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '')
            .map(line => {
                // Match pattern: number + x + card code
                const match = line.match(/^(\d+)x([A-Z0-9-]+)/);
                if (match) {
                    return {
                        code: match[2],
                        quantity: parseInt(match[1])
                    };
                }
                return null;
            })
            .filter(item => item !== null);
    }

    /**
     * Generate gumgum.gg URL format (semicolon-separated)
     * @param {Array<{code: string, quantity: number}>} cards
     * @returns {string}
     */
    function generateGumgumUrl(cards) {
        if (cards.length === 0) return '';
        
        const deckString = cards
            .map(card => `${card.quantity}x${card.code}`)
            .join(';');
        
        return `https://gumgum.gg/deckbuilder?deck=${deckString}`;
    }

    /**
     * Generate Egman URL format (colon-separated with type parameter)
     * @param {Array<{code: string, quantity: number}>} cards
     * @returns {string}
     */
    function generateEgmanUrl(cards) {
        if (cards.length === 0) return '';
        
        const deckString = cards
            .map(card => `${card.code}:${card.quantity}`)
            .join(',');
        
        return `https://deckbuilder.egmanevents.com/?deck=${deckString}&type=optcg`;
    }

    /**
     * Generate CardKaizoku URL format (base64 encoded JSON)
     * @param {Array<{code: string, quantity: number}>} cards
     * @returns {string}
     */
    function generateCardkaizokuUrl(cards) {
        if (cards.length === 0) return '';
        
        /** @type {Record<string, number>} */
        const deckObject = {};
        cards.forEach(card => {
            deckObject[card.code] = card.quantity;
        });
        
        const jsonString = JSON.stringify(deckObject);
        const base64String = btoa(jsonString);
        
        return `https://deckbuilder.cardkaizoku.com/?deck=${base64String}`;
    }

    function generateLinks() {
        const cards = parseDecklist();
        
        generatedLinks = {
            gumgum: generateGumgumUrl(cards),
            egman: generateEgmanUrl(cards),
            cardkaizoku: generateCardkaizokuUrl(cards)
        };
    }

    /**
     * Copy link to clipboard
     * @param {string} url
     * @param {string} siteName
     */
    async function copyToClipboard(url, siteName) {
        try {
            await navigator.clipboard.writeText(url);
            // Could add a toast notification here in the future
            console.log(`${siteName} link copied to clipboard`);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    }
</script>

<main class="min-h-screen bg-ctp-base">
    <div class="container mx-auto max-w-7xl p-6">
        <h1 class="mb-8 text-3xl font-bold text-ctp-text">Deckbuilder Links Generator</h1>
        
        <div class="grid gap-8 xl:grid-cols-5 lg:grid-cols-3">
            <!-- Input Section - Takes up more space -->
            <div class="xl:col-span-2 lg:col-span-1">
                <Section title="Deck List Input">
                    <div class="mb-4">
                        <p class="text-sm text-ctp-subtext0 mb-4">
                            Paste your sim deck list here (format: 1xOP12-001, 4xOP01-016, etc.)
                        </p>
                        <TextArea
                            bind:this={textArea}
                            bind:value={content}
                            on:input={handleInput}
                            placeholder="1xOP12-001&#10;4xOP01-016&#10;4xOP03-008&#10;4xOP12-006&#10;4xOP12-014&#10;4xST01-011&#10;2xOP01-025&#10;4xOP10-005&#10;2xEB01-003&#10;4xOP12-015&#10;3xOP12-016&#10;4xOP12-017&#10;4xOP12-018&#10;3xOP12-019&#10;2xOP06-018&#10;2xST21-017"
                            customClass="h-96 font-mono text-sm resize-none"
                            autofocus
                        />
                    </div>
                </Section>
            </div>

            <!-- Generated Links Section - Takes up remaining space -->
            <div class="xl:col-span-3 lg:col-span-2">
                <Section title="Generated Links">
                    {#if generatedLinks.gumgum || generatedLinks.egman || generatedLinks.cardkaizoku}
                        <div class="space-y-6">
                            <!-- gumgum.gg -->
                            {#if generatedLinks.gumgum}
                                <div class="border border-ctp-surface2 rounded-lg p-6 bg-ctp-surface0">
                                    <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-lg font-semibold text-ctp-text">gumgum.gg</h3>
                                        <button 
                                            class="px-4 py-2 text-sm bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire transition-colors"
                                            onclick={() => copyToClipboard(generatedLinks.gumgum, 'gumgum.gg')}
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                    <a 
                                        href={generatedLinks.gumgum} 
                                        target="_blank" 
                                        class="text-ctp-blue hover:text-ctp-sapphire text-sm break-all leading-relaxed block p-3 bg-ctp-surface1 rounded border hover:bg-ctp-surface2 transition-colors"
                                    >
                                        {generatedLinks.gumgum}
                                    </a>
                                </div>
                            {/if}

                            <!-- Egman -->
                            {#if generatedLinks.egman}
                                <div class="border border-ctp-surface2 rounded-lg p-6 bg-ctp-surface0">
                                    <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-lg font-semibold text-ctp-text">Egman Events</h3>
                                        <button 
                                            class="px-4 py-2 text-sm bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire transition-colors"
                                            onclick={() => copyToClipboard(generatedLinks.egman, 'Egman')}
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                    <a 
                                        href={generatedLinks.egman} 
                                        target="_blank" 
                                        class="text-ctp-blue hover:text-ctp-sapphire text-sm break-all leading-relaxed block p-3 bg-ctp-surface1 rounded border hover:bg-ctp-surface2 transition-colors"
                                    >
                                        {generatedLinks.egman}
                                    </a>
                                </div>
                            {/if}

                            <!-- CardKaizoku -->
                            {#if generatedLinks.cardkaizoku}
                                <div class="border border-ctp-surface2 rounded-lg p-6 bg-ctp-surface0">
                                    <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-lg font-semibold text-ctp-text">CardKaizoku</h3>
                                        <button 
                                            class="px-4 py-2 text-sm bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire transition-colors"
                                            onclick={() => copyToClipboard(generatedLinks.cardkaizoku, 'CardKaizoku')}
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                    <a 
                                        href={generatedLinks.cardkaizoku} 
                                        target="_blank" 
                                        class="text-ctp-blue hover:text-ctp-sapphire text-sm break-all leading-relaxed block p-3 bg-ctp-surface1 rounded border hover:bg-ctp-surface2 transition-colors"
                                    >
                                        {generatedLinks.cardkaizoku}
                                    </a>
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <div class="text-center py-16">
                            <div class="text-6xl text-ctp-overlay0 mb-4">⚡</div>
                            <p class="text-ctp-subtext0 text-lg mb-2">Ready to generate links</p>
                            <p class="text-ctp-subtext1 text-sm">Enter a deck list to see deckbuilder links appear here</p>
                        </div>
                    {/if}
                </Section>
            </div>
        </div>
    </div>
</main>

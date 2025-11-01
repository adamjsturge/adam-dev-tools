<svelte:head>
    <title>Color Opacity - Dev Tools</title>
</svelte:head>

<script>
    import { onMount } from 'svelte';
    import Section from '$lib/components/Section.svelte';

    let colorInput = $state('#3B82F6');
    let parsedColor = $state({ r: 59, g: 130, b: 246, valid: true });
    let copiedIndex = $state(-1);

    const STORAGE_KEY = 'color-opacity-input';

    /** @type {HTMLInputElement} */
    let inputComponent;

    onMount(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            colorInput = saved;
            parseColor(saved);
        }
        inputComponent?.focus();
    });

    /**
     * Parse a color string (hex or named color) to RGB
     * @param {string} color
     * @returns {{r: number, g: number, b: number, valid: boolean}}
     */
    function parseColor(color) {
        color = color.trim();
        
        // Try hex format first
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            let r, g, b;
            
            if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length === 6) {
                r = parseInt(hex.slice(0, 2), 16);
                g = parseInt(hex.slice(2, 4), 16);
                b = parseInt(hex.slice(4, 6), 16);
            } else {
                return { r: 0, g: 0, b: 0, valid: false };
            }
            
            if (isNaN(r) || isNaN(g) || isNaN(b)) {
                return { r: 0, g: 0, b: 0, valid: false };
            }
            
            return { r, g, b, valid: true };
        }
        
        // Try rgb/rgba format
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3]),
                valid: true
            };
        }
        
        // Try named color using canvas
        if (typeof document !== 'undefined') {
            const ctx = document.createElement('canvas').getContext('2d');
            if (ctx) {
                ctx.fillStyle = color;
                const computed = ctx.fillStyle;
                if (computed.startsWith('#')) {
                    return parseColor(computed);
                }
            }
        }
        
        return { r: 0, g: 0, b: 0, valid: false };
    }

    $effect(() => {
        if (colorInput === '') {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
            }
            parsedColor = { r: 0, g: 0, b: 0, valid: false };
        } else {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, colorInput);
            }
            parsedColor = parseColor(colorInput);
        }
    });

    /**
     * Convert RGB and opacity to hex by blending with white background
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} opacity - 0 to 1
     * @returns {string}
     */
    function rgbaToHex(r, g, b, opacity) {
        // Blend the color with white background to get the final appearance
        const finalR = Math.round((r * opacity) + (255 * (1 - opacity)));
        const finalG = Math.round((g * opacity) + (255 * (1 - opacity)));
        const finalB = Math.round((b * opacity) + (255 * (1 - opacity)));
        
        const hexR = finalR.toString(16).padStart(2, '0');
        const hexG = finalG.toString(16).padStart(2, '0');
        const hexB = finalB.toString(16).padStart(2, '0');
        
        return '#' + hexR + hexG + hexB;
    }

    /**
     * Convert RGB and opacity to rgba string
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} opacity
     * @returns {string}
     */
    function rgbaString(r, g, b, opacity) {
        return `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`;
    }

    /**
     * Copy text to clipboard
     * @param {string} text
     * @param {number} index
     */
    async function copyToClipboard(text, index) {
        try {
            await navigator.clipboard.writeText(text);
            copiedIndex = index;
            setTimeout(() => {
                copiedIndex = -1;
            }, 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    // Generate opacity levels
    const opacityLevels = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05];
</script>

<main class="container mx-auto p-4 max-w-4xl">
    <h1 class="mb-4 text-2xl font-bold">Color Opacity (Beta)</h1>
    <p class="mb-6 text-ctp-subtext1">
        Enter a color (hex, RGB, or color name) and see it at different opacity levels.
    </p>

    <Section title="Input Color">
        <div class="flex gap-4 items-end">
            <div class="flex-1">
                <label class="mb-2 block" for="color-input">Color</label>
                <input
                    id="color-input"
                    type="text"
                    bind:value={colorInput}
                    placeholder="#3B82F6 or rgb(59, 130, 246) or blue"
                    class="w-full p-2 border rounded-lg bg-ctp-base text-ctp-text border-ctp-surface1"
                    bind:this={inputComponent}
                />
            </div>
            {#if parsedColor.valid}
                <div 
                    class="w-16 h-16 rounded border-2 border-ctp-surface2 bg-white"
                    style="background-image: linear-gradient(rgba({parsedColor.r}, {parsedColor.g}, {parsedColor.b}, 1), rgba({parsedColor.r}, {parsedColor.g}, {parsedColor.b}, 1));"
                ></div>
            {/if}
        </div>
        {#if !parsedColor.valid && colorInput !== ''}
            <p class="mt-2 text-ctp-red text-sm">Invalid color format</p>
        {/if}
    </Section>

    {#if parsedColor.valid}
        <Section title="Opacity Variations">
            <div class="grid grid-cols-1 gap-3">
                {#each opacityLevels as opacity, index}
                    {@const hexCode = rgbaToHex(parsedColor.r, parsedColor.g, parsedColor.b, opacity)}
                    {@const rgbaCode = rgbaString(parsedColor.r, parsedColor.g, parsedColor.b, opacity)}
                    <div class="flex items-center gap-4 p-3 rounded-lg bg-ctp-surface0 border border-ctp-surface1">
                        <div class="w-20 text-center font-semibold text-ctp-text">
                            {Math.round(opacity * 100)}%
                        </div>
                        <div 
                            class="w-16 h-16 rounded border-2 border-ctp-surface2"
                            style="background-color: {hexCode};"
                        ></div>
                        <div class="flex-1 flex flex-col gap-2">
                            <div class="flex items-center gap-2">
                                <code class="flex-1 px-3 py-2 bg-ctp-surface1 rounded font-mono text-sm text-ctp-text">
                                    {hexCode}
                                </code>
                                <button
                                    class="px-3 py-2 bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire text-sm"
                                    onclick={() => copyToClipboard(hexCode, index * 2)}
                                >
                                    {copiedIndex === index * 2 ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>
                            <div class="flex items-center gap-2">
                                <code class="flex-1 px-3 py-2 bg-ctp-surface1 rounded font-mono text-sm text-ctp-text">
                                    {rgbaCode}
                                </code>
                                <button
                                    class="px-3 py-2 bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire text-sm"
                                    onclick={() => copyToClipboard(rgbaCode, index * 2 + 1)}
                                >
                                    {copiedIndex === index * 2 + 1 ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </Section>
    {/if}
</main>


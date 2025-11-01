<svelte:head>
    <title>Text Compare - Dev Tools</title>
</svelte:head>

<script>
    import { onMount } from 'svelte';
    import TextArea from '$lib/components/TextArea.svelte';

    let text1 = $state('');
    let text2 = $state('');
    let showDiff = $state(false);
    /** @type {Array<{type: 'equal'|'added'|'removed', content: string}>} */
    let diffResult = $state([]);
    
    const STORAGE_KEY_1 = 'compare-text1';
    const STORAGE_KEY_2 = 'compare-text2';

    /** @type {import('$lib/components/TextArea.svelte').default} */
    let textArea1;

    onMount(() => {
        const savedText1 = localStorage.getItem(STORAGE_KEY_1);
        const savedText2 = localStorage.getItem(STORAGE_KEY_2);
        if (savedText1) text1 = savedText1;
        if (savedText2) text2 = savedText2;
        textArea1?.focus();
    });

    function handleInput1() {
        if (text1 === '') {
            localStorage.removeItem(STORAGE_KEY_1);
        } else {
            localStorage.setItem(STORAGE_KEY_1, text1);
        }
        showDiff = false;
    }

    function handleInput2() {
        if (text2 === '') {
            localStorage.removeItem(STORAGE_KEY_2);
        } else {
            localStorage.setItem(STORAGE_KEY_2, text2);
        }
        showDiff = false;
    }

    /**
     * Simple diff algorithm that compares texts line by line
     * @param {string} text1 
     * @param {string} text2 
     * @returns {Array<{type: 'equal'|'added'|'removed', content: string}>}
     */
    function computeDiff(text1, text2) {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const result = [];
        
        let i = 0, j = 0;
        
        while (i < lines1.length || j < lines2.length) {
            if (i >= lines1.length) {
                // Only lines from text2 remain
                result.push({ type: /** @type {'added'} */('added'), content: lines2[j] });
                j++;
            } else if (j >= lines2.length) {
                // Only lines from text1 remain
                result.push({ type: /** @type {'removed'} */('removed'), content: lines1[i] });
                i++;
            } else if (lines1[i] === lines2[j]) {
                // Lines are equal
                result.push({ type: /** @type {'equal'} */('equal'), content: lines1[i] });
                i++;
                j++;
            } else {
                // Lines are different - look ahead to see if we can find a match
                let found = false;
                
                // Look for lines1[i] in upcoming lines2
                for (let k = j + 1; k < Math.min(j + 5, lines2.length); k++) {
                    if (lines1[i] === lines2[k]) {
                        // Found a match, add removed lines from text2
                        for (let l = j; l < k; l++) {
                            result.push({ type: /** @type {'added'} */('added'), content: lines2[l] });
                        }
                        result.push({ type: /** @type {'equal'} */('equal'), content: lines1[i] });
                        i++;
                        j = k + 1;
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    // Look for lines2[j] in upcoming lines1
                    for (let k = i + 1; k < Math.min(i + 5, lines1.length); k++) {
                        if (lines2[j] === lines1[k]) {
                            // Found a match, add removed lines from text1
                            for (let l = i; l < k; l++) {
                                result.push({ type: /** @type {'removed'} */('removed'), content: lines1[l] });
                            }
                            result.push({ type: /** @type {'equal'} */('equal'), content: lines2[j] });
                            i = k + 1;
                            j++;
                            found = true;
                            break;
                        }
                    }
                }
                
                if (!found) {
                    // No match found, treat as different lines
                    result.push({ type: /** @type {'removed'} */('removed'), content: lines1[i] });
                    result.push({ type: /** @type {'added'} */('added'), content: lines2[j] });
                    i++;
                    j++;
                }
            }
        }
        
        return result;
    }

    function compareTexts() {
        diffResult = computeDiff(text1, text2);
        showDiff = true;
    }

    function clearAll() {
        text1 = '';
        text2 = '';
        showDiff = false;
        diffResult = [];
        localStorage.removeItem(STORAGE_KEY_1);
        localStorage.removeItem(STORAGE_KEY_2);
        textArea1?.focus();
    }
</script>

<main class="flex h-screen flex-col p-4">
    <h1 class="mb-4 text-2xl font-bold">Text Compare</h1>
    
    <div class="mb-4 flex gap-2">
        <button 
            class="px-4 py-2 bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire"
            onclick={compareTexts}
        >
            Compare Texts
        </button>
        <button 
            class="px-4 py-2 bg-ctp-surface2 text-ctp-text rounded hover:bg-ctp-overlay0"
            onclick={clearAll}
        >
            Clear All
        </button>
    </div>

    {#if !showDiff}
        <div class="flex-1 flex gap-4">
            <div class="flex-1 flex flex-col">
                <h2 class="mb-2 text-lg font-semibold">Text 1 (Original)</h2>
                <TextArea
                    bind:this={textArea1}
                    bind:value={text1}
                    on:input={handleInput1}
                    customClass="h-full"
                    placeholder="Paste your first text here..."
                    autofocus
                />
            </div>
            <div class="flex-1 flex flex-col">
                <h2 class="mb-2 text-lg font-semibold">Text 2 (Compare to)</h2>
                <TextArea
                    bind:value={text2}
                    on:input={handleInput2}
                    customClass="h-full"
                    placeholder="Paste your second text here..."
                />
            </div>
        </div>
    {:else}
        <div class="flex-1 overflow-auto">
            <div class="mb-4 flex items-center gap-4">
                <h2 class="text-lg font-semibold">Comparison Result</h2>
                <button 
                    class="px-3 py-1 bg-ctp-surface2 text-ctp-text rounded hover:bg-ctp-overlay0 text-sm"
                    onclick={() => showDiff = false}
                >
                    Back to Edit
                </button>
            </div>
            
            <div class="mb-4 text-sm text-ctp-subtext1">
                <span class="inline-block w-4 h-4 bg-ctp-red/30 border border-ctp-red mr-2"></span>Removed from original
                <span class="inline-block w-4 h-4 bg-ctp-green/30 border border-ctp-green mr-2 ml-4"></span>Added in comparison
                <span class="inline-block w-4 h-4 bg-ctp-surface1 border border-ctp-surface2 mr-2 ml-4"></span>Unchanged
            </div>
            
            <div class="border rounded-lg p-4 bg-ctp-surface0 border-ctp-surface1 font-mono text-sm whitespace-pre-wrap">
                {#each diffResult as line}
                    {#if line.type === 'equal'}
                        <div class="bg-ctp-surface1 px-2 py-1 border-l-4 border-ctp-surface2">{line.content}</div>
                    {:else if line.type === 'removed'}
                        <div class="bg-ctp-red/20 px-2 py-1 border-l-4 border-ctp-red text-ctp-red">- {line.content}</div>
                    {:else if line.type === 'added'}
                        <div class="bg-ctp-green/20 px-2 py-1 border-l-4 border-ctp-green text-ctp-green">+ {line.content}</div>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
</main> 
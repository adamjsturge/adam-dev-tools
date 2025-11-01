<script>
    import Input from '$lib/components/Input.svelte';
    import Tile from '$lib/components/Tile.svelte';
    import Section from '$lib/components/Section.svelte';
    import QuickBind from '$lib/components/QuickBind.svelte';

    /**
     * Calculate hypergeometric probability
     * @param {number} N Population size (deck size)
     * @param {number} K Success states in population (relevant cards)
     * @param {number} n Sample size (hand size)
     * @param {number} k Successes in sample (cards in hand)
     * @returns {number} Probability of exactly k successes
     */
    function hypergeometric(N, K, n, k) {
        const combinations = (/** @type {number} */ n, /** @type {number} */ r) => {
            if (r > n) return 0;
            let p = 1;
            for (let i = 1; i <= r; i++) {
                p *= (n - i + 1) / i;
            }
            return Math.round(p);
        };

        return (combinations(K, k) * combinations(N - K, n - k)) / combinations(N, n);
    }

    const defaultValues = {
        deckSize: 50,
        relevantCards: 12,
        handSize: 5,
        discardedCards: 0,
        knownRelevantInHand: 0
    };

    function resetToDefault() {
        deckSize = defaultValues.deckSize;
        relevantCards = defaultValues.relevantCards;
        handSize = defaultValues.handSize;
        discardedCards = defaultValues.discardedCards;
        knownRelevantInHand = defaultValues.knownRelevantInHand;
    }

    let deckSize = defaultValues.deckSize;
    let relevantCards = defaultValues.relevantCards;
    let handSize = defaultValues.handSize;
    let discardedCards = defaultValues.discardedCards;
    let knownRelevantInHand = defaultValues.knownRelevantInHand;

    $: adjustedDeckSize = deckSize - discardedCards;
    $: adjustedRelevantCards = relevantCards - discardedCards;
    $: remainingHandSize = handSize - knownRelevantInHand;
    $: remainingRelevantCards = adjustedRelevantCards - knownRelevantInHand;
    $: maxPossible = Math.min(remainingRelevantCards, remainingHandSize) + knownRelevantInHand;
    
    $: probabilities = Array.from({ length: maxPossible + 1 }, (_, i) => {
        if (i < knownRelevantInHand) return { amount: i, probability: 0 };
        const additional = i - knownRelevantInHand;
        return {
            amount: i,
            probability: hypergeometric(
                adjustedDeckSize - knownRelevantInHand,  // remaining deck size
                remainingRelevantCards,                   // remaining relevant cards
                remainingHandSize,                        // remaining cards to draw
                additional                               // additional hits needed
            )
        };
    });

    $: highestProbability = Math.max(...probabilities.map(p => p.probability));

    const gameStatePresets = [
        {
            label: 'Start of Game',
            values: {
                deckSize: (/** @type {any} */ def) => def,
            }
        },
        {
            label: 'First Turn',
            values: {
                deckSize: (/** @type {number} */ def) => def - 10,
            }
        },
        {
            label: 'Late Game',
            values: {
                deckSize: (/** @type {number} */ def) => def - 16,
            }
        }
    ];

    const relevantCardPresets = [
        {
            label: 'Standard 2ks',
            values: {
                relevantCards: 12
            }
        },
        {
            label: 'Low 2ks',
            values: {
                relevantCards: 8
            }
        },
        {
            label: 'High 2ks',
            values: {
                relevantCards: 16
            }
        }
    ];

    /**
	 * @param {Object.<string, number>} updates
	 */
    function handlePresetUpdate(updates) {
        for (const [key, value] of Object.entries(updates)) {
            if (key === 'deckSize') deckSize = value;
            if (key === 'relevantCards') relevantCards = value;
        }
    }
</script>

<svelte:head>
    <title>Card Assumption Calculator - Dev Tools</title>
</svelte:head>

<main class="flex h-screen flex-col items-center p-4">
    <h1 class="mb-4 text-2xl font-bold">Card Assumption Calculator</h1>

    <Section title="Calculate Opponent's Hand Probabilities">
        <div class="flex flex-col gap-4 mb-4">
            <div class="flex justify-between items-center">
                <!-- <span class="text-sm font-medium">Game State:</span> -->
                <QuickBind
                    presets={gameStatePresets}
                    defaultValues={defaultValues}
                    bindings={{ deckSize }}
                    onUpdate={handlePresetUpdate}
                />
            </div>
            <div class="flex justify-between items-center">
                <!-- <span class="text-sm font-medium">Relevant Cards:</span> -->
                <QuickBind
                    presets={relevantCardPresets}
                    defaultValues={defaultValues}
                    bindings={{ relevantCards }}
                    onUpdate={handlePresetUpdate}
                />
            </div>
            <div class="flex justify-end">
                <button
                    class="px-4 py-2 text-sm font-medium text-ctp-base bg-ctp-blue rounded-md hover:bg-ctp-sapphire"
                    on:click={resetToDefault}
                >
                    Reset to Default
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Input
                id="deckSize"
                label="Opponent's Deck Size"
                bind:value={deckSize}
                min={1}
            />
            <Input
                id="relevantCards"
                label="Total Relevant Cards"
                bind:value={relevantCards}
                max={deckSize}
            />
            <Input
                id="handSize"
                label="Opponent's Hand Size"
                bind:value={handSize}
                max={adjustedDeckSize}
            />
            <Input
                id="discardedCards"
                label="Known Discarded Cards"
                bind:value={discardedCards}
                max={relevantCards}
            />
            <Input
                id="knownRelevantInHand"
                label="Known Relevant Cards in Hand"
                bind:value={knownRelevantInHand}
                min={0}
                max={Math.min(handSize, adjustedRelevantCards)}
            />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each probabilities as { amount, probability }}
                <Tile 
                    title={`Has ${amount} ${amount === 1 ? 'Card' : 'Cards'}`}
                    value={probability}
                    highlight={probability === highestProbability}
                />
            {/each}
        </div>
    </Section>
</main>

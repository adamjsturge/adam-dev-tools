<script>
    import Input from '$lib/components/Input.svelte';
    import Tile from '$lib/components/Tile.svelte';
    import Section from '$lib/components/Section.svelte';
    import QuickBind from '$lib/components/QuickBind.svelte';

    /**
     * Calculate hypergeometric probability
     * @param {number} N Population size (deck size)
     * @param {number} K Success states in population (copies ran)
     * @param {number} n Sample size (cards drawn)
     * @param {number} k Successes in sample (odds to have)
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

    /**
     * Calculate probability of at least X successes
     * @param {number} N Population size
     * @param {number} K Success states
     * @param {number} n Sample size
     * @param {number} minimum Minimum successes needed
     * @returns {number} Probability of at least minimum successes
     */
    function atLeast(N, K, n, minimum) {
        let probability = 0;
        for (let i = minimum; i <= Math.min(n, K); i++) {
            probability += hypergeometric(N, K, n, i);
        }
        return probability;
    }

    /**
     * Calculate probability with one mulligan
     * @param {number} N Population size
     * @param {number} K Success states
     * @param {number} n Sample size
     * @param {number} minimum Minimum successes needed
     * @returns {number} Probability with one mulligan
     */
    function withMulligan(N, K, n, minimum) {
        const firstTry = atLeast(N, K, n, minimum);
        const secondTry = atLeast(N, K, n, minimum);
        return firstTry + (1 - firstTry) * secondTry;
    }

    const defaultValues = {
        singleCard: {
            deckSize: 50,
            copiesRan: 4,
            cardsDrawn: 5,
            oddsToHave: 1
        },
        multiCard: {
            deckSize: 50,
            copiesCardA: 4,
            copiesCardB: 4,
            drawSize: 5
        }
    };

    function resetSingleCard() {
        deckSize = defaultValues.singleCard.deckSize;
        copiesRan = defaultValues.singleCard.copiesRan;
        cardsDrawn = defaultValues.singleCard.cardsDrawn;
        oddsToHave = defaultValues.singleCard.oddsToHave;
    }

    function resetMultiCard() {
        mvDeckSize = defaultValues.multiCard.deckSize;
        copiesCardA = defaultValues.multiCard.copiesCardA;
        copiesCardB = defaultValues.multiCard.copiesCardB;
        mvDrawSize = defaultValues.multiCard.drawSize;
    }

    let deckSize = 50;
    let copiesRan = 4;
    let cardsDrawn = 5;
    let oddsToHave = 1;

    $: exactProbability = hypergeometric(deckSize, copiesRan, cardsDrawn, oddsToHave);
    $: atLeastProbability = atLeast(deckSize, copiesRan, cardsDrawn, oddsToHave);
    $: mulliganProbability = withMulligan(deckSize, copiesRan, cardsDrawn, oddsToHave);

    // Add new variables for Multivariate Intersect
    let mvDeckSize = 50;
    let copiesCardA = 4;
    let copiesCardB = 4;
    let mvDrawSize = 5;

    /**
     * Calculate probability of drawing at least 1 of each card
     * @param {number} N Deck size
     * @param {number} A Copies of card A
     * @param {number} B Copies of card B
     * @param {number} d Draw size
     * @returns {number} Probability of drawing at least 1 of each card
     */
    function calculateMultivariateIntersect(N, A, B, d) {
        // P(at least 1 of each) = 1 - P(no A) - P(no B) + P(neither)
        const combinations = (/** @type {number} */ n, /** @type {number} */ r) => {
            if (r > n) return 0;
            let p = 1;
            for (let i = 1; i <= r; i++) {
                p *= (n - i + 1) / i;
            }
            return Math.round(p);
        };

        // Probability of drawing no copies of A
        const pNoA = combinations(N - A, d) / combinations(N, d);
        // Probability of drawing no copies of B
        const pNoB = combinations(N - B, d) / combinations(N, d);
        // Probability of drawing neither A nor B
        const pNeither = combinations(N - A - B, d) / combinations(N, d);

        // P(at least 1 of each) = 1 - P(no A) - P(no B) + P(neither)
        return 1 - pNoA - pNoB + pNeither;
    }

    /**
     * Calculate probability with mulligan for Multivariate Intersect
     * @param {number} N Deck size
     * @param {number} A Copies of card A
     * @param {number} B Copies of card B
     * @param {number} d Draw size
     * @returns {number} Probability with one mulligan
     */
    function calculateMultivariateMulligan(N, A, B, d) {
        const firstTry = calculateMultivariateIntersect(N, A, B, d);
        const secondTry = calculateMultivariateIntersect(N, A, B, d);
        return firstTry + (1 - firstTry) * secondTry;
    }

    $: mvProbability = calculateMultivariateIntersect(mvDeckSize, copiesCardA, copiesCardB, mvDrawSize);
    $: mvMulliganProbability = calculateMultivariateMulligan(mvDeckSize, copiesCardA, copiesCardB, mvDrawSize);

    const gameStatePresets = [
        {
            label: 'Start of Game',
            values: {
                deckSize: (/** @type {any} */ def) => def,
                mvDeckSize: (/** @type {any} */ def) => def
            }
        },
        {
            label: 'First Turn',
            values: {
                deckSize: (/** @type {number} */ def) => def - 10,
                mvDeckSize: (/** @type {number} */ def) => def - 10
            }
        },
        {
            label: 'Late Game',
            values: {
                deckSize: (/** @type {number} */ def) => def - 16,
                mvDeckSize: (/** @type {number} */ def) => def - 16
            }
        }
    ];

    // Add draw size presets
    const drawSizePresets = [
        {
            label: 'Cards Drawn 3',
            values: {
                cardsDrawn: () => 3,
                mvDrawSize: () => 3
            }
        },
        {
            label: 'Cards Drawn 4',
            values: {
                cardsDrawn: () => 4,
                mvDrawSize: () => 4
            }
        },
        {
            label: 'Cards Drawn 5',
            values: {
                cardsDrawn: () => 5,
                mvDrawSize: () => 5
            }
        }
    ];

    /**
	 * @param {Object.<string, number>} updates
	 */
    function handlePresetUpdate(updates) {
        for (const [key, value] of Object.entries(updates)) {
            if (key === 'deckSize') deckSize = value;
            if (key === 'mvDeckSize') mvDeckSize = value;
            if (key === 'cardsDrawn') cardsDrawn = value;
            if (key === 'mvDrawSize') mvDrawSize = value;
        }
    }
</script>

<svelte:head>
    <title>Deck Draw Odds - Dev Tools</title>
</svelte:head>

<main class="flex h-screen flex-col items-center p-4">
    <h1 class="mb-4 text-2xl font-bold">Deck Draw Odds Calculator</h1>

    <Section title="Single Card Probability Calculator">
        <div class="flex flex-col gap-4 mb-4">
            <div class="flex justify-between items-center">
                <!-- <span class="text-sm font-medium">Game State:</span> -->
                <QuickBind
                    presets={gameStatePresets}
                    defaultValues={defaultValues.singleCard}
                    bindings={{ deckSize, mvDeckSize }}
                    onUpdate={handlePresetUpdate}
                />
            </div>
            <div class="flex justify-between items-center">
                <!-- <span class="text-sm font-medium">Cards Drawn:</span> -->
                <QuickBind
                    presets={drawSizePresets}
                    defaultValues={defaultValues.singleCard}
                    bindings={{ cardsDrawn, mvDrawSize }}
                    onUpdate={handlePresetUpdate}
                />
            </div>
            <div class="flex justify-end">
                <button
                    class="px-4 py-2 text-sm font-medium text-ctp-base bg-ctp-blue rounded-md hover:bg-ctp-sapphire"
                    on:click={resetSingleCard}
                >
                    Reset Single Card
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Input
                id="deckSize"
                label="Deck Size"
                bind:value={deckSize}
            />
            <Input
                id="copiesRan"
                label="Copies Ran"
                bind:value={copiesRan}
                max={deckSize}
            />
            <Input
                id="cardsDrawn"
                label="Cards Drawn"
                bind:value={cardsDrawn}
                max={deckSize}
            />
            <Input
                id="oddsToHave"
                label="Odds to Have"
                bind:value={oddsToHave}
                max={Math.min(copiesRan, cardsDrawn)}
            />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Tile title="Exact Probability" value={exactProbability} />
            <Tile title="At Least Probability" value={atLeastProbability} />
            <Tile title="With One Mulligan" value={mulliganProbability} />
        </div>
    </Section>

    <Section title="Multi Card Probability Calculator" customClass="mt-8">
        <div class="flex justify-end mb-4">
            <button
                class="px-4 py-2 text-sm font-medium text-ctp-base bg-ctp-blue rounded-md hover:bg-ctp-sapphire"
                on:click={resetMultiCard}
            >
                Reset Multi Card
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Input
                id="mvDeckSize"
                label="Deck Size"
                bind:value={mvDeckSize}
            />
            <Input
                id="copiesCardA"
                label="Copies of Card A"
                bind:value={copiesCardA}
                max={mvDeckSize}
            />
            <Input
                id="copiesCardB"
                label="Copies of Card B"
                bind:value={copiesCardB}
                max={mvDeckSize}
            />
            <Input
                id="mvDrawSize"
                label="Draw Size"
                bind:value={mvDrawSize}
                min={2}
                max={mvDeckSize}
            />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Tile title="Probability of Drawing Both" value={mvProbability} />
            <Tile title="With One Mulligan" value={mvMulliganProbability} />
        </div>
    </Section>
</main>

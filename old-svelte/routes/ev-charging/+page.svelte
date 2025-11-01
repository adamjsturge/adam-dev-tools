<svelte:head>
    <title>EV Charging Estimator - Dev Tools</title>
</svelte:head>

<script>
    import { onMount } from 'svelte';
    import Input from '$lib/components/Input.svelte';
    import Section from '$lib/components/Section.svelte';

    let currentCharge = $state(20);
    let targetCharge = $state(80);
    let estimatedMinutes = $state(45);
    let startTime = $state('');
    let showResults = $state(false);
    
    /** @type {Array<{time: number, charge: number, actualTime: string}>} */
    let chargingData = $state([]);
    
    let hoverInfo = $state({ time: 0, charge: 0, actualTime: '' });
    
    const STORAGE_KEYS = {
        currentCharge: 'ev-current-charge',
        targetCharge: 'ev-target-charge',
        estimatedMinutes: 'ev-estimated-minutes',
        startTime: 'ev-start-time'
    };

    // Derived values using Svelte 5 $derived
    const chargeRange = $derived(targetCharge - currentCharge);
    const isValidInputs = $derived(currentCharge < targetCharge && estimatedMinutes > 0);

    onMount(() => {
        // Load saved values
        const savedCurrentCharge = localStorage.getItem(STORAGE_KEYS.currentCharge);
        const savedTargetCharge = localStorage.getItem(STORAGE_KEYS.targetCharge);
        const savedEstimatedMinutes = localStorage.getItem(STORAGE_KEYS.estimatedMinutes);
        const savedStartTime = localStorage.getItem(STORAGE_KEYS.startTime);
        
        if (savedCurrentCharge) currentCharge = Number(savedCurrentCharge);
        if (savedTargetCharge) targetCharge = Number(savedTargetCharge);
        if (savedEstimatedMinutes) estimatedMinutes = Number(savedEstimatedMinutes);
        if (savedStartTime) startTime = savedStartTime;
    });

    function saveToStorage() {
        localStorage.setItem(STORAGE_KEYS.currentCharge, currentCharge.toString());
        localStorage.setItem(STORAGE_KEYS.targetCharge, targetCharge.toString());
        localStorage.setItem(STORAGE_KEYS.estimatedMinutes, estimatedMinutes.toString());
        localStorage.setItem(STORAGE_KEYS.startTime, startTime);
    }

    function setCurrentTime() {
        const now = new Date();
        startTime = now.toTimeString().slice(0, 5); // HH:MM format
        saveToStorage();
    }

    /**
     * Format minutes into human-readable time with better accessibility
     * @param {number} minutes
     * @returns {string}
     */
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        
        if (hours === 0) {
            return mins === 1 ? '1 minute' : `${mins} minutes`;
        } else if (mins === 0) {
            return hours === 1 ? '1 hour' : `${hours} hours`;
        } else {
            const hourText = hours === 1 ? '1 hour' : `${hours} hours`;
            const minText = mins === 1 ? '1 minute' : `${mins} minutes`;
            return `${hourText} and ${minText}`;
        }
    }

    /**
     * Format time in short format for display
     * @param {number} minutes
     * @returns {string}
     */
    function formatTimeShort(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    }

    /**
     * Add minutes to a time string
     * @param {string} timeStr - Time in HH:MM format
     * @param {number} minutesToAdd - Minutes to add
     * @returns {string}
     */
    function addMinutesToTime(timeStr, minutesToAdd) {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + minutesToAdd, 0, 0);
        return date.toTimeString().slice(0, 5);
    }

    /**
     * Convert 24-hour time to 12-hour AM/PM format
     * @param {string} timeStr - Time in HH:MM format
     * @returns {string}
     */
    function formatTimeAmPm(timeStr) {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    function generateChargingCurve() {
        const data = [];
        const totalMinutes = estimatedMinutes;
        
        // Generate linear charging curve for slow charging
        for (let i = 0; i <= 100; i++) {
            const progress = i / 100;
            
            // Linear progression - no curve, constant charging rate
            const minutes = progress * totalMinutes;
            const charge = currentCharge + (chargeRange * progress);
            const actualTime = addMinutesToTime(startTime, minutes);
            
            data.push({
                time: minutes,
                charge: Math.min(charge, targetCharge),
                actualTime
            });
        }
        
        return data;
    }

    function calculateCharging() {
        if (!isValidInputs) {
            alert('Please check your inputs: Current charge must be less than target charge and time must be greater than 0');
            return;
        }
        
        chargingData = generateChargingCurve();
        showResults = true;
        saveToStorage();
    }

    /**
     * Handle mouse movement over the chart
     * @param {MouseEvent} event
     */
    function handleMouseMove(event) {
        const svg = /** @type {SVGElement} */ (event.currentTarget);
        if (!svg) return;
        
        const rect = svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const svgWidth = 600;
        const padding = 60;
        const chartWidth = svgWidth - (padding * 2);
        
        // Calculate which data point we're closest to
        const relativeX = Math.max(0, Math.min(chartWidth, x - padding));
        const progress = relativeX / chartWidth;
        const dataIndex = Math.round(progress * (chargingData.length - 1));
        
        if (dataIndex >= 0 && dataIndex < chargingData.length) {
            const point = chargingData[dataIndex];
            hoverInfo = {
                time: point.time,
                charge: point.charge,
                actualTime: point.actualTime
            };
        }
    }

    function getChargingPath() {
        if (chargingData.length === 0) return '';
        
        const svgWidth = 600;
        const svgHeight = 400;
        const padding = 60;
        const chartWidth = svgWidth - (padding * 2);
        const chartHeight = svgHeight - (padding * 2);
        
        const maxTime = Math.max(...chargingData.map(d => d.time));
        const minCharge = Math.min(currentCharge, ...chargingData.map(d => d.charge));
        const maxCharge = Math.max(targetCharge, ...chargingData.map(d => d.charge));
        
        return chargingData.map((point, index) => {
            const x = padding + (point.time / maxTime) * chartWidth;
            const y = padding + chartHeight - ((point.charge - minCharge) / (maxCharge - minCharge)) * chartHeight;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    }

    function getGridLines() {
        const svgWidth = 600;
        const svgHeight = 400;
        const padding = 60;
        const chartWidth = svgWidth - (padding * 2);
        const chartHeight = svgHeight - (padding * 2);
        
        const lines = [];
        
        // Horizontal grid lines (charge levels)
        for (let i = 0; i <= 10; i++) {
            const y = padding + (i / 10) * chartHeight;
            const charge = targetCharge - (i / 10) * chargeRange;
            lines.push({
                type: 'horizontal',
                x1: padding,
                y1: y,
                x2: padding + chartWidth,
                y2: y,
                label: `${Math.round(charge)}%`,
                labelX: padding - 10,
                labelY: y + 4
            });
        }
        
        // Vertical grid lines (time)
        for (let i = 0; i <= 6; i++) {
            const x = padding + (i / 6) * chartWidth;
            const minutes = (i / 6) * estimatedMinutes;
            const timeLabel = formatTimeShort(minutes);
            const actualTime = addMinutesToTime(startTime, minutes);
            
            lines.push({
                type: 'vertical',
                x1: x,
                y1: padding,
                x2: x,
                y2: padding + chartHeight,
                label: timeLabel,
                actualTime: actualTime,
                labelX: x,
                labelY: padding + chartHeight + 20
            });
        }
        
        return lines;
    }

    function reset() {
        showResults = false;
        chargingData = [];
        currentCharge = 20;
        targetCharge = 80;
        estimatedMinutes = 45;
        startTime = '';
        // Clear localStorage
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }

    /**
     * Handle current charge input change
     * @param {Event} event
     */
    function handleCurrentChargeInput(event) {
        const target = /** @type {HTMLInputElement} */ (event.target);
        currentCharge = Number(target.value) || 0;
        saveToStorage();
    }

    /**
     * Handle target charge input change
     * @param {Event} event
     */
    function handleTargetChargeInput(event) {
        const target = /** @type {HTMLInputElement} */ (event.target);
        targetCharge = Number(target.value) || 0;
        saveToStorage();
    }

    /**
     * Handle estimated minutes input change
     * @param {Event} event
     */
    function handleEstimatedMinutesInput(event) {
        const target = /** @type {HTMLInputElement} */ (event.target);
        estimatedMinutes = Number(target.value) || 0;
        saveToStorage();
    }

    /**
     * Handle start time input change
     * @param {Event} event
     */
    function handleStartTimeInput(event) {
        const target = /** @type {HTMLInputElement} */ (event.target);
        startTime = target.value;
        saveToStorage();
    }
</script>

<main class="flex h-screen flex-col p-4 max-w-6xl mx-auto">
    <h1 class="mb-6 text-3xl font-bold text-center">⚡ EV Charging Estimator</h1>
    
    <div class="mb-4 p-4 bg-ctp-surface0 rounded-lg text-center">
        <p class="text-ctp-blue">
            <strong>Slow Charging Model:</strong> This estimator assumes linear charging throughout the entire process.
            Unlike fast charging which typically slows down at 80%, slow charging (Level 1/2) maintains a consistent rate.
        </p>
    </div>
    
    {#if !showResults}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Section title="Battery Information">
                <div class="grid grid-cols-2 gap-4">
                    <Input
                        label="Current Charge (%)"
                        value={currentCharge}
                        min={0}
                        max={100}
                        oninput={handleCurrentChargeInput}
                    />
                    <Input
                        label="Target Charge (%)"
                        value={targetCharge}
                        min={0}
                        max={100}
                        oninput={handleTargetChargeInput}
                    />
                </div>
            </Section>

            <Section title="Charging Time">
                <Input
                    label="Estimated Time (minutes)"
                    type="number"
                    min={1}
                    value={estimatedMinutes}
                    placeholder="45"
                    oninput={handleEstimatedMinutesInput}
                />
                <p class="text-sm text-ctp-subtext1 mt-2">
                    Time your car estimates to reach target charge
                </p>
            </Section>

            <Section title="Start Time" customClass="md:col-span-2">
                <div class="flex gap-2 items-end">
                    <Input
                        label="Start Time (optional)"
                        type="time"
                        value={startTime}
                        customClass="flex-1"
                        oninput={handleStartTimeInput}
                    />
                    <button
                        class="px-4 py-2 bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire h-10"
                        onclick={setCurrentTime}
                    >
                        Now
                    </button>
                </div>
                <p class="text-sm text-ctp-subtext1 mt-2">
                    Set to see actual completion times (times will display in AM/PM format)
                </p>
            </Section>
        </div>

        <div class="flex justify-center gap-4 mt-8">
            <button
                class="px-6 py-3 bg-ctp-green text-ctp-base rounded-lg hover:bg-ctp-teal font-semibold"
                onclick={calculateCharging}
            >
                Calculate Charging
            </button>
            <button
                class="px-6 py-3 bg-ctp-surface2 text-ctp-text rounded-lg hover:bg-ctp-overlay0"
                onclick={reset}
            >
                Reset
            </button>
        </div>
    {:else}
        <div class="flex-1 flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h2 class="text-xl font-semibold">
                        Charging from {currentCharge}% to {targetCharge}% 
                    </h2>
                    <p class="text-sm text-ctp-subtext1" aria-label="Total charging time: {formatTime(estimatedMinutes)}">
                        Duration: {formatTime(estimatedMinutes)}
                    </p>
                </div>
                <button
                    class="px-4 py-2 bg-ctp-surface2 text-ctp-text rounded hover:bg-ctp-overlay0"
                    onclick={() => showResults = false}
                >
                    Back to Settings
                </button>
            </div>

            <div class="bg-ctp-surface0 rounded-lg shadow-lg p-6 flex-1">
                <div class="relative">
                    <svg
                        width="600"
                        height="400"
                        class="border rounded-lg bg-ctp-mantle border-ctp-surface1"
                        role="img"
                        aria-label="EV charging curve showing linear progression from {currentCharge}% to {targetCharge}% over {formatTime(estimatedMinutes)}"
                        onmousemove={handleMouseMove}
                        onmouseleave={() => hoverInfo = { time: 0, charge: 0, actualTime: '' }}
                    >
                        <!-- Grid lines -->
                        {#each getGridLines() as line}
                            <line
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                class="stroke-ctp-surface2"
                                stroke-width="1"
                            />
                            <text
                                x={line.labelX}
                                y={line.labelY}
                                class="fill-ctp-subtext0"
                                font-size="12"
                                text-anchor={line.type === 'horizontal' ? 'end' : 'middle'}
                            >
                                {line.label}
                            </text>
                            {#if line.actualTime && startTime}
                                                            <text
                                x={line.labelX}
                                y={line.labelY + 15}
                                class="fill-ctp-subtext1"
                                font-size="10"
                                text-anchor="middle"
                            >
                                {formatTimeAmPm(line.actualTime)}
                            </text>
                            {/if}
                        {/each}

                        <!-- Charging curve -->
                        <path
                            d={getChargingPath()}
                            fill="none"
                            class="stroke-ctp-green"
                            stroke-width="3"
                            stroke-linecap="round"
                        />

                        <!-- Current and target markers -->
                        <circle cx="60" cy={340 - ((currentCharge - currentCharge) / chargeRange) * 280} r="6" class="fill-ctp-red" />
                        <circle cx="540" cy={340 - (chargeRange / chargeRange) * 280} r="6" class="fill-ctp-green" />
                    </svg>

                    <!-- Hover tooltip -->
                    {#if hoverInfo.charge > 0}
                        <div class="absolute top-4 right-4 bg-ctp-surface2 text-ctp-text p-3 rounded-lg text-sm shadow-lg border border-ctp-surface1">
                            <div><strong>{Math.round(hoverInfo.charge)}%</strong> charge</div>
                            <div>After {formatTime(hoverInfo.time)}</div>
                            {#if hoverInfo.actualTime && startTime}
                                <div>At {formatTimeAmPm(hoverInfo.actualTime)}</div>
                            {/if}
                        </div>
                    {/if}
                </div>

                <!-- Legend -->
                <div class="mt-4 flex justify-center gap-6 text-sm">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-ctp-red rounded-full"></div>
                        <span class="text-ctp-text">Start ({currentCharge}%)</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-1 bg-ctp-green"></div>
                        <span class="text-ctp-text">Linear Charging Progress</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-ctp-green rounded-full"></div>
                        <span class="text-ctp-text">Target ({targetCharge}%)</span>
                    </div>
                </div>

                <!-- Summary stats -->
                <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div class="bg-ctp-blue/20 p-4 rounded-lg border border-ctp-blue/30">
                        <div class="text-2xl font-bold text-ctp-blue">{chargeRange}%</div>
                        <div class="text-ctp-subtext0">Charge Added</div>
                    </div>
                    <div class="bg-ctp-green/20 p-4 rounded-lg border border-ctp-green/30">
                        <div class="text-2xl font-bold text-ctp-green" aria-label="Total time: {formatTime(estimatedMinutes)}">
                            {formatTimeShort(estimatedMinutes)}
                        </div>
                        <div class="text-ctp-subtext0">Total Time</div>
                        <div class="text-xs text-ctp-subtext1 mt-1">
                            {formatTime(estimatedMinutes)}
                        </div>
                    </div>
                    {#if startTime}
                        <div class="bg-ctp-mauve/20 p-4 rounded-lg border border-ctp-mauve/30">
                            <div class="text-2xl font-bold text-ctp-mauve">
                                {formatTimeAmPm(addMinutesToTime(startTime, estimatedMinutes))}
                            </div>
                            <div class="text-ctp-subtext0">Completion Time</div>
                        </div>
                    {:else}
                        <div class="bg-ctp-surface1 p-4 rounded-lg border border-ctp-surface2">
                            <div class="text-lg text-ctp-subtext1">Set start time</div>
                            <div class="text-ctp-subtext0">for completion time</div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</main> 
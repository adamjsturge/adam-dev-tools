<svelte:head>
    <title>QR Code Scanner - Dev Tools</title>
</svelte:head>

<script>
	import QrScanner from 'qr-scanner';
	import Section from '$lib/components/Section.svelte';

	/** @type {string} */
	let result = $state('');
	
	/** @type {string} */
	let error = $state('');
	
	/** @type {string} */
	let imageSrc = $state('');
	
	/** @type {boolean} */
	let isScanning = $state(false);

	/**
	 * Handles QR code scanning from an image file
	 * @param {File} file - The image file to scan
	 */
	const scanQRFromFile = async (file) => {
		isScanning = true;
		error = '';
		result = '';
		
		try {
			// Create object URL for display
			imageSrc = URL.createObjectURL(file);
			
			// Scan QR code from file
			const qrResult = await QrScanner.scanImage(file);
			result = qrResult;
		} catch (err) {
			error = 'No QR code found in the image';
			console.error('QR scan error:', err);
		} finally {
			isScanning = false;
		}
	};

	/**
	 * Handles file input change
	 * @param {Event & { currentTarget: HTMLInputElement }} event
	 */
	const handleFileChange = (event) => {
		const file = event.currentTarget.files?.[0];
		if (file && file.type.startsWith('image/')) {
			scanQRFromFile(file);
		}
	};

	/**
	 * Handles paste events from clipboard
	 * @param {ClipboardEvent} event
	 */
	const handlePaste = (event) => {
		const items = event.clipboardData?.items;
		if (!items) return;

		for (let item of items) {
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) {
					scanQRFromFile(file);
					return;
				}
			}
		}
	};

	/**
	 * Handles reading from clipboard via button click
	 */
	const handleClipboardRead = async () => {
		try {
			// Check if clipboard API is supported
			if (!navigator.clipboard || !navigator.clipboard.read) {
				error = 'Clipboard access is not supported in this browser';
				return;
			}

			const clipboardItems = await navigator.clipboard.read();
			
			for (const clipboardItem of clipboardItems) {
				for (const type of clipboardItem.types) {
					if (type.startsWith('image/')) {
						const blob = await clipboardItem.getType(type);
						// Convert blob to file
						const file = new File([blob], `clipboard-image.${type.split('/')[1]}`, { type });
						scanQRFromFile(file);
						return;
					}
				}
			}
			
			error = 'No image found in clipboard';
		} catch (err) {
			if (err instanceof Error && err.name === 'NotAllowedError') {
				error = 'Permission denied. Please allow clipboard access or use Ctrl+V instead';
			} else {
				error = 'Failed to read from clipboard. Try using Ctrl+V instead';
			}
			console.error('Clipboard read error:', err);
		}
	};

	/**
	 * Copies the result to clipboard
	 */
	const copyResult = async () => {
		if (result) {
			try {
				await navigator.clipboard.writeText(result);
			} catch (err) {
				console.error('Failed to copy to clipboard:', err);
			}
		}
	};

	/**
	 * Clears the current scan results and image
	 */
	const clearScan = () => {
		result = '';
		error = '';
		imageSrc = '';
		if (imageSrc) {
			URL.revokeObjectURL(imageSrc);
		}
	};
</script>

<svelte:window on:paste={handlePaste} />

<main class="min-h-screen bg-ctp-base">
	<div class="container mx-auto px-4 py-6 sm:py-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-3 text-3xl font-bold text-ctp-text sm:text-4xl">QR Code Scanner</h1>
			<p class="text-ctp-subtext0 text-lg">Scan QR codes from images instantly</p>
		</div>

		<div class="mx-auto max-w-3xl">
			<!-- Main Scanner Card -->
			<div class="mb-6 rounded-2xl bg-ctp-surface0 p-6 shadow-lg sm:p-8">
				<!-- Instructions -->
				<div class="mb-6 rounded-xl bg-ctp-surface1 p-4 sm:p-5">
					<div class="mb-3 flex items-center gap-2">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-ctp-blue">
							<svg class="h-5 w-5 text-ctp-base" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 class="text-lg font-semibold text-ctp-text sm:text-xl">How to scan</h2>
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="flex items-start gap-3">
							<div class="flex-shrink-0">
								<div class="flex h-6 w-6 items-center justify-center rounded-full bg-ctp-blue/20 text-ctp-blue">
									<span class="text-sm font-bold">1</span>
								</div>
							</div>
							<div>
								<p class="text-ctp-text font-medium">Paste from clipboard</p>
								<p class="text-sm text-ctp-subtext0">Use button below or <kbd class="rounded bg-ctp-surface2 px-2 py-1 text-xs font-mono text-ctp-text">Ctrl+V</kbd></p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<div class="flex-shrink-0">
								<div class="flex h-6 w-6 items-center justify-center rounded-full bg-ctp-green/20 text-ctp-green">
									<span class="text-sm font-bold">2</span>
								</div>
							</div>
							<div>
								<p class="text-ctp-text font-medium">Upload image file</p>
								<p class="text-sm text-ctp-subtext0">PNG, JPG, WebP supported</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Quick Actions -->
				<div class="mb-6 flex flex-col gap-3 sm:flex-row">
					<button
						onclick={handleClipboardRead}
						class="flex flex-1 items-center justify-center gap-3 rounded-xl bg-ctp-surface2 p-4 transition-colors hover:bg-ctp-overlay0 focus:outline-none focus:ring-2 focus:ring-ctp-surface2 focus:ring-offset-2 focus:ring-offset-ctp-base"
					>
						<svg class="h-6 w-6 text-ctp-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
						</svg>
						<div class="text-left">
							<p class="font-medium text-ctp-text">Paste from Clipboard</p>
							<p class="text-sm text-ctp-subtext0">Tap to paste image</p>
						</div>
					</button>
				</div>

				<!-- File Upload Area -->
				<div class="mb-6">
					<label class="group relative block">
						<input
							type="file"
							accept="image/*"
							onchange={handleFileChange}
							class="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
						/>
						<div class="flex min-h-[120px] items-center justify-center rounded-xl border-2 border-dashed border-ctp-surface2 bg-ctp-base p-6 transition-all duration-200 hover:border-ctp-blue hover:bg-ctp-surface1 peer-focus:border-ctp-blue peer-focus:ring-2 peer-focus:ring-ctp-blue peer-focus:ring-opacity-20 sm:min-h-[140px]">
							<div class="text-center">
								<svg class="mx-auto mb-3 h-12 w-12 text-ctp-subtext0 group-hover:text-ctp-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
								</svg>
								<p class="mb-1 text-lg font-medium text-ctp-text">Drop image here or click to browse</p>
								<p class="text-sm text-ctp-subtext0">Supports PNG, JPG, WebP, and other image formats</p>
							</div>
						</div>
					</label>
				</div>

				<!-- Loading State -->
				{#if isScanning}
					<div class="mb-6 flex flex-col items-center justify-center rounded-xl bg-ctp-blue/10 p-6">
						<div class="mb-3 h-8 w-8 animate-spin rounded-full border-3 border-ctp-blue border-t-transparent"></div>
						<p class="text-ctp-blue font-medium">Scanning QR code...</p>
					</div>
				{/if}

				<!-- Error State -->
				{#if error}
					<div class="mb-6 rounded-xl border border-ctp-red/30 bg-ctp-red/10 p-4">
						<div class="flex items-center gap-3">
							<svg class="h-5 w-5 flex-shrink-0 text-ctp-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
							<p class="text-ctp-red font-medium">{error}</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- Image Preview -->
			{#if imageSrc}
				<div class="mb-6 rounded-2xl bg-ctp-surface0 p-6 shadow-lg">
					<h3 class="mb-4 text-lg font-semibold text-ctp-text">Uploaded Image</h3>
					<div class="overflow-hidden rounded-xl">
						<img
							src={imageSrc}
							alt="Uploaded QR code"
							class="mx-auto max-h-80 w-full max-w-full object-contain"
						/>
					</div>
				</div>
			{/if}

			<!-- Results -->
			{#if result}
				<div class="mb-6 rounded-2xl bg-ctp-green/10 p-6 shadow-lg">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-ctp-green">
							<svg class="h-5 w-5 text-ctp-base" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-ctp-green sm:text-xl">QR Code Content</h3>
					</div>
					<div class="mb-4 rounded-xl border border-ctp-surface2 bg-ctp-base p-4">
						<code class="block break-all text-sm text-ctp-text sm:text-base">{result}</code>
					</div>
					<div class="flex flex-col gap-3 sm:flex-row">
						<button
							onclick={copyResult}
							class="flex items-center justify-center gap-2 rounded-xl bg-ctp-blue px-6 py-3 font-medium text-ctp-base transition-colors hover:bg-ctp-sapphire focus:outline-none focus:ring-2 focus:ring-ctp-blue focus:ring-offset-2 focus:ring-offset-ctp-base"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							Copy to Clipboard
						</button>
						{#if result.startsWith('http://') || result.startsWith('https://')}
							<a
								href={result}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center justify-center gap-2 rounded-xl bg-ctp-mauve px-6 py-3 font-medium text-ctp-base transition-colors hover:bg-ctp-pink focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-2 focus:ring-offset-ctp-base"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
								Open Link
							</a>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Clear Button -->
			{#if result || error || imageSrc}
				<div class="text-center">
					<button
						onclick={clearScan}
						class="rounded-xl bg-ctp-surface2 px-6 py-3 font-medium text-ctp-text transition-colors hover:bg-ctp-overlay0 focus:outline-none focus:ring-2 focus:ring-ctp-surface2 focus:ring-offset-2 focus:ring-offset-ctp-base"
					>
						Clear Results
					</button>
				</div>
			{/if}
		</div>
	</div>
</main>

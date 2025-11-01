<svelte:head>
    <title>QR Code Generator - Dev Tools</title>
</svelte:head>

<script>
	import QRCode from 'qrcode';

	let url = $state('');
	let qrCodeDataUrl = $state('');
	let isAdvancedMode = $state(false);
	
	// Advanced settings
	let darkColor = $state('#000000');
	let lightColor = $state('#FFFFFF');
	let errorCorrection = $state('H');
	let qrSize = $state(1024);
	let margin = $state(2);
	let cornerRadius = $state(0);
	let cornerDots = $state(false);
	
	// Logo settings
	/** @type {File | null} */
	let logoFile = $state(null);
	let logoDataUrl = $state('');
	let logoSize = $state(20); // percentage of QR code size
	let logoPosition = $state('center');
	let logoBackground = $state(false);
	let logoPadding = $state(5);
	
	// Preset color themes
	const colorPresets = [
		{ name: 'Classic', dark: '#000000', light: '#FFFFFF' },
		{ name: 'Blue', dark: '#1e40af', light: '#dbeafe' },
		{ name: 'Green', dark: '#166534', light: '#dcfce7' },
		{ name: 'Purple', dark: '#6b21a8', light: '#f3e8ff' },
		{ name: 'Red', dark: '#991b1b', light: '#fee2e2' },
		{ name: 'Orange', dark: '#c2410c', light: '#fed7aa' },
		{ name: 'Teal', dark: '#0f766e', light: '#ccfbf1' },
		{ name: 'Pink', dark: '#be185d', light: '#fce7f3' }
	];

	/**
	 * @param {Event} event
	 */
	const handleLogoUpload = (event) => {
		const target = /** @type {HTMLInputElement} */ (event.target);
		const file = target.files?.[0];
		if (file) {
			logoFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result;
				if (typeof result === 'string') {
					logoDataUrl = result;
					// Automatically set to high error correction when logo is added
					if (errorCorrection !== 'H') {
						errorCorrection = 'H';
					}
					// Check if image has transparency (optional - for user information)
					checkImageTransparency(result);
				}
			};
			reader.readAsDataURL(file);
		}
	};
	
	/**
	 * Check if an image has transparency
	 * @param {string} dataUrl
	 */
	const checkImageTransparency = (dataUrl) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d', { alpha: true });
			if (!ctx) return;
			
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;
			
			// Check for any transparent or semi-transparent pixels
			let hasTransparency = false;
			for (let i = 3; i < data.length; i += 4) {
				if (data[i] < 255) {
					hasTransparency = true;
					break;
				}
			}
			
			// You could store this information if needed
			console.log('Logo has transparency:', hasTransparency);
		};
		img.src = dataUrl;
	};

	const removeLogo = () => {
		logoFile = null;
		logoDataUrl = '';
		const input = /** @type {HTMLInputElement | null} */ (document.getElementById('logo-input'));
		if (input) input.value = '';
	};

	/**
	 * @param {{name: string, dark: string, light: string}} preset
	 */
	const applyColorPreset = (preset) => {
		darkColor = preset.dark;
		lightColor = preset.light;
	};

	const generateQRCode = async () => {
		try {
			const options = {
				errorCorrectionLevel: isAdvancedMode ? errorCorrection : 'H',
				type: 'image/png',
				quality: 1,
				margin: isAdvancedMode ? margin : 2,
				width: isAdvancedMode ? qrSize : 1024,
				color: {
					dark: isAdvancedMode ? darkColor : '#000000',
					light: isAdvancedMode ? lightColor : '#FFFFFF'
				}
			};
			
			// Generate base QR code
			if (isAdvancedMode && (cornerRadius > 0 || logoDataUrl)) {
				// For advanced features, we need to use canvas manipulation
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d', { alpha: true });
				if (!ctx) {
					console.error('Failed to get canvas context');
					return;
				}
				canvas.width = qrSize;
				canvas.height = qrSize;
				
				// Clear canvas and ensure transparency support
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				
				// Generate QR code to canvas
				await QRCode.toCanvas(canvas, url, options);
				
				// Apply corner radius if needed
				if (cornerRadius > 0) {
					applyCornerRadius(ctx, canvas.width, canvas.height, cornerRadius);
				}
				
				// Add logo if uploaded
				if (logoDataUrl) {
					try {
						await addLogoToCanvas(ctx, canvas.width, canvas.height);
					} catch (error) {
						console.error('Error adding logo:', error);
						// Continue without logo if there's an error
					}
				}
				
				// Export with full quality and transparency support
				qrCodeDataUrl = canvas.toDataURL('image/png', 1.0);
			} else {
				// Simple mode or no special features
				qrCodeDataUrl = await QRCode.toDataURL(url, options);
			}
		} catch (err) {
			console.error(err);
		}
	};
	
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} width
	 * @param {number} height
	 * @param {number} radius
	 */
	const applyCornerRadius = (ctx, width, height, radius) => {
		// Apply corner radius by manipulating the image data
		const imageData = ctx.getImageData(0, 0, width, height);
		const data = imageData.data;
		const moduleCount = Math.sqrt((width - margin * 2) / 10); // Approximate module count
		const moduleSize = (width - margin * 2) / moduleCount;
		const cornerPixels = Math.floor(radius * moduleSize / 100);
		
		// This is a simplified corner rounding - in production you'd want more sophisticated algorithm
		if (cornerDots) {
			// Round the corner dots specially
			for (let i = 0; i < 3; i++) {
				const positions = [
					{ x: margin, y: margin }, // Top-left
					{ x: width - margin - 7 * moduleSize, y: margin }, // Top-right
					{ x: margin, y: height - margin - 7 * moduleSize } // Bottom-left
				];
				
				positions.forEach(pos => {
					roundCornerPattern(ctx, pos.x, pos.y, 7 * moduleSize, cornerPixels, darkColor);
				});
			}
		}
		
		ctx.putImageData(imageData, 0, 0);
	};
	
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} x
	 * @param {number} y
	 * @param {number} size
	 * @param {number} radius
	 * @param {string} color
	 */
	const roundCornerPattern = (ctx, x, y, size, radius, color) => {
		ctx.save();
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + size - radius, y);
		ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
		ctx.lineTo(x + size, y + size - radius);
		ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
		ctx.lineTo(x + radius, y + size);
		ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	};
	
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} width
	 * @param {number} height
	 * @returns {Promise<void>}
	 */
	const addLogoToCanvas = async (ctx, width, height) => {
		return new Promise((resolve, reject) => {
			const logo = new Image();
			
			logo.onload = () => {
				const logoWidth = (width * logoSize) / 100;
				const logoHeight = (logoWidth * logo.height) / logo.width;
				
				let x, y;
				switch(logoPosition) {
					case 'center':
						x = (width - logoWidth) / 2;
						y = (height - logoHeight) / 2;
						break;
					case 'top-left':
						x = width * 0.1;
						y = height * 0.1;
						break;
					case 'top-right':
						x = width * 0.9 - logoWidth;
						y = height * 0.1;
						break;
					case 'bottom-left':
						x = width * 0.1;
						y = height * 0.9 - logoHeight;
						break;
					case 'bottom-right':
						x = width * 0.9 - logoWidth;
						y = height * 0.9 - logoHeight;
						break;
					default:
						x = (width - logoWidth) / 2;
						y = (height - logoHeight) / 2;
				}
				
				// Create a temporary canvas for the logo to ensure proper alpha handling
				const logoCanvas = document.createElement('canvas');
				const logoCtx = logoCanvas.getContext('2d', { alpha: true });
				
				if (!logoCtx) {
					reject(new Error('Failed to create logo canvas context'));
					return;
				}
				
				logoCanvas.width = logoWidth;
				logoCanvas.height = logoHeight;
				
				// Clear the logo canvas to ensure transparency
				logoCtx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
				
				// Draw the logo onto the temporary canvas
				logoCtx.drawImage(logo, 0, 0, logoWidth, logoHeight);
				
				// Now draw onto the main canvas
				// Add background padding if enabled (this will block QR code)
				if (logoBackground) {
					const padding = logoPadding;
					ctx.fillStyle = lightColor;
					ctx.fillRect(
						x - padding, 
						y - padding, 
						logoWidth + padding * 2, 
						logoHeight + padding * 2
					);
				}
				
				// Draw the logo from the temporary canvas
				// This ensures transparency is properly preserved
				ctx.drawImage(logoCanvas, x, y);
				
				resolve(undefined);
			};
			
			logo.onerror = () => {
				reject(new Error('Failed to load logo image'));
			};
			
			logo.src = logoDataUrl;
		});
	};

	const saveQRCode = () => {
		const link = document.createElement('a');
		link.href = qrCodeDataUrl;
		link.download = `qrcode-${Date.now()}.png`;
		link.click();
	};
	
	const resetAdvancedSettings = () => {
		darkColor = '#000000';
		lightColor = '#FFFFFF';
		errorCorrection = 'H';
		qrSize = 1024;
		margin = 2;
		cornerRadius = 0;
		cornerDots = false;
		logoSize = 20;
		logoPosition = 'center';
		logoBackground = true;
		logoPadding = 5;
		removeLogo();
	};
</script>

<main class="min-h-screen bg-ctp-base">
	<div class="container mx-auto px-4 py-6 sm:py-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-3 text-3xl font-bold text-ctp-text sm:text-4xl">QR Code Generator</h1>
			<p class="text-ctp-subtext0 text-lg">Generate high-quality QR codes instantly</p>
			
			<!-- Mode Toggle -->
			<div class="mt-6 flex items-center justify-center gap-4">
				<button
					onclick={() => isAdvancedMode = false}
					class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {!isAdvancedMode ? 'bg-ctp-blue text-ctp-base' : 'bg-ctp-surface1 text-ctp-subtext0 hover:bg-ctp-surface2'}"
				>
					Simple Mode
				</button>
				<button
					onclick={() => isAdvancedMode = true}
					class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {isAdvancedMode ? 'bg-ctp-blue text-ctp-base' : 'bg-ctp-surface1 text-ctp-subtext0 hover:bg-ctp-surface2'}"
				>
					Advanced Mode
				</button>
			</div>
		</div>

		<div class="mx-auto max-w-6xl">
			<div class="grid gap-6 {isAdvancedMode ? 'lg:grid-cols-2' : ''}">
				<!-- Input and Settings Column -->
				<div>
					<!-- Input Card -->
					<div class="mb-6 rounded-2xl bg-ctp-surface0 p-6 shadow-lg sm:p-8">
						<div class="mb-6">
							<label for="url-input" class="mb-2 block text-sm font-medium text-ctp-text">
								Enter URL or Text
							</label>
							<input
								id="url-input"
								type="text"
								bind:value={url}
								placeholder="https://example.com or any text"
								class="w-full rounded-xl border border-ctp-surface2 bg-ctp-base px-4 py-3 text-ctp-text placeholder:text-ctp-subtext0 focus:border-ctp-blue focus:outline-none focus:ring-2 focus:ring-ctp-blue focus:ring-opacity-20"
							/>
						</div>
						
						{#if isAdvancedMode}
							<!-- Advanced Settings -->
							<div class="space-y-6 border-t border-ctp-surface2 pt-6">
								<!-- Color Settings -->
								<div>
									<h3 class="mb-4 text-sm font-semibold text-ctp-text">Colors</h3>
									
									<!-- Color Presets -->
									<div class="mb-4">
										<p class="mb-2 text-xs text-ctp-subtext0">Quick Presets</p>
										<div class="grid grid-cols-4 gap-2">
											{#each colorPresets as preset}
												<button
													onclick={() => applyColorPreset(preset)}
													class="rounded-lg border border-ctp-surface2 px-2 py-1.5 text-xs font-medium text-ctp-text transition-colors hover:bg-ctp-surface1"
													style="background: linear-gradient(to right, {preset.dark} 50%, {preset.light} 50%)"
												>
													<span class="bg-ctp-base px-1 rounded">{preset.name}</span>
												</button>
											{/each}
										</div>
									</div>
									
									<!-- Color Pickers -->
									<div class="grid grid-cols-2 gap-4">
										<div>
											<label for="dark-color" class="mb-1 block text-xs text-ctp-subtext0">
												Foreground Color
											</label>
											<div class="flex items-center gap-2">
												<input
													id="dark-color"
													type="color"
													bind:value={darkColor}
													class="h-10 w-full cursor-pointer rounded-lg border border-ctp-surface2"
												/>
												<input
													type="text"
													bind:value={darkColor}
													class="w-24 rounded-lg border border-ctp-surface2 bg-ctp-base px-2 py-1.5 text-xs text-ctp-text"
												/>
											</div>
										</div>
										<div>
											<label for="light-color" class="mb-1 block text-xs text-ctp-subtext0">
												Background Color
											</label>
											<div class="flex items-center gap-2">
												<input
													id="light-color"
													type="color"
													bind:value={lightColor}
													class="h-10 w-full cursor-pointer rounded-lg border border-ctp-surface2"
												/>
												<input
													type="text"
													bind:value={lightColor}
													class="w-24 rounded-lg border border-ctp-surface2 bg-ctp-base px-2 py-1.5 text-xs text-ctp-text"
												/>
											</div>
										</div>
									</div>
								</div>
								
				<!-- Logo Settings -->
				<div>
					<h3 class="mb-4 text-sm font-semibold text-ctp-text flex items-center gap-2">
						Logo
						<span class="rounded-full bg-ctp-mauve px-2 py-0.5 text-xs font-medium text-ctp-base">
							BETA
						</span>
					</h3>
									
									{#if !logoDataUrl}
										<label for="logo-input" class="block">
											<div class="cursor-pointer rounded-xl border-2 border-dashed border-ctp-surface2 bg-ctp-surface1 p-4 text-center transition-colors hover:border-ctp-blue hover:bg-ctp-surface2">
												<svg class="mx-auto mb-2 h-8 w-8 text-ctp-subtext0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
												</svg>
												<p class="text-xs text-ctp-subtext0">Click to upload logo</p>
												<p class="mt-1 text-xs text-ctp-subtext1">PNG, JPG, SVG up to 2MB</p>
												<p class="mt-1 text-xs text-ctp-green">✓ Transparency supported</p>
											</div>
										</label>
										<input
											id="logo-input"
											type="file"
											accept="image/*"
											onchange={handleLogoUpload}
											class="hidden"
										/>
									{:else}
										<div class="space-y-4">
											<div class="flex items-center gap-4">
												<img
													src={logoDataUrl}
													alt="Logo preview"
													class="h-16 w-16 rounded-lg border border-ctp-surface2 object-contain"
												/>
												<button
													onclick={removeLogo}
													class="rounded-lg bg-ctp-red px-3 py-1.5 text-xs font-medium text-ctp-base transition-colors hover:bg-ctp-maroon"
												>
													Remove Logo
												</button>
											</div>
											
											<!-- Logo Warning -->
											<div class="rounded-lg bg-ctp-yellow/10 border border-ctp-yellow/30 p-3">
												<div class="flex items-start gap-2">
													<svg class="h-4 w-4 text-ctp-yellow mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
													</svg>
													<div class="text-xs text-ctp-yellow">
														<p class="font-medium mb-1">Important: Test Your QR Code</p>
														<p class="text-ctp-subtext0">Adding a logo may reduce scannability. Always test your QR code with multiple devices before using it. Error correction has been automatically set to High for better reliability with logos.</p>
														<p class="text-ctp-subtext0 mt-1">💡 Tip: Transparent logos are fully supported - transparency will be preserved unless you enable background padding.</p>
													</div>
												</div>
											</div>
											
											<!-- Logo Position -->
											<div>
												<label for="logo-position" class="mb-1 block text-xs text-ctp-subtext0">Position</label>
												<select
													id="logo-position"
													bind:value={logoPosition}
													class="w-full rounded-lg border border-ctp-surface2 bg-ctp-base px-3 py-2 text-xs text-ctp-text"
												>
													<option value="center">Center</option>
													<option value="top-left">Top Left</option>
													<option value="top-right">Top Right</option>
													<option value="bottom-left">Bottom Left</option>
													<option value="bottom-right">Bottom Right</option>
												</select>
											</div>
											
											<!-- Logo Size -->
											<div>
												<label for="logo-size" class="mb-1 block text-xs text-ctp-subtext0">
													Logo Size: {logoSize}%
												</label>
												<input
													id="logo-size"
													type="range"
													min="10"
													max="40"
													bind:value={logoSize}
													class="w-full"
												/>
											</div>
											
							<!-- Logo Options -->
							<div class="flex items-center gap-4">
								<label class="flex items-center gap-2 text-xs text-ctp-text">
									<input
										type="checkbox"
										bind:checked={logoBackground}
										class="rounded border-ctp-surface2"
									/>
									Add background to logo
								</label>
												{#if logoBackground}
													<div class="flex items-center gap-2">
													<label for="logo-padding" class="text-xs text-ctp-subtext0">Padding:</label>
													<input
														id="logo-padding"
														type="number"
														min="0"
														max="20"
														bind:value={logoPadding}
														class="w-16 rounded-lg border border-ctp-surface2 bg-ctp-base px-2 py-1 text-xs text-ctp-text"
													/>
													</div>
												{/if}
											</div>
										</div>
									{/if}
								</div>
								
								<!-- QR Code Settings -->
								<div>
									<h3 class="mb-4 text-sm font-semibold text-ctp-text">QR Code Settings</h3>
									
									<div class="space-y-4">
										<!-- Error Correction -->
										<div>
											<label for="error-correction" class="mb-1 block text-xs text-ctp-subtext0">
												Error Correction Level
											</label>
											<select
												id="error-correction"
												bind:value={errorCorrection}
												class="w-full rounded-lg border border-ctp-surface2 bg-ctp-base px-3 py-2 text-xs text-ctp-text"
											>
												<option value="L">Low (7%)</option>
												<option value="M">Medium (15%)</option>
												<option value="Q">Quartile (25%)</option>
												<option value="H">High (30%)</option>
											</select>
										</div>
										
										<!-- Size -->
										<div>
											<label for="qr-size" class="mb-1 block text-xs text-ctp-subtext0">
												Size: {qrSize}px
											</label>
											<input
												id="qr-size"
												type="range"
												min="256"
												max="2048"
												step="256"
												bind:value={qrSize}
												class="w-full"
											/>
										</div>
										
										<!-- Margin -->
										<div>
											<label for="qr-margin" class="mb-1 block text-xs text-ctp-subtext0">
												Quiet Zone: {margin} modules
											</label>
											<input
												id="qr-margin"
												type="range"
												min="0"
												max="10"
												bind:value={margin}
												class="w-full"
											/>
										</div>
										
										<!-- Corner Radius -->
										<div>
											<label for="corner-radius" class="mb-1 block text-xs text-ctp-subtext0">
												<span class="flex items-center gap-2">
													Corner Softness: {cornerRadius}%
													<span class="rounded-full bg-ctp-mauve px-1.5 py-0.5 text-xs font-medium text-ctp-base">
														BETA
													</span>
												</span>
											</label>
											<input
												id="corner-radius"
												type="range"
												min="0"
												max="50"
												bind:value={cornerRadius}
												class="w-full"
											/>
										</div>
										
										<!-- Special Options -->
										<label class="flex items-center gap-2 text-xs text-ctp-text">
											<input
												type="checkbox"
												bind:checked={cornerDots}
												class="rounded border-ctp-surface2"
											/>
											<span class="flex items-center gap-2">
												Round corner detection patterns
												<span class="rounded-full bg-ctp-mauve px-1.5 py-0.5 text-xs font-medium text-ctp-base">
													BETA
												</span>
											</span>
										</label>
									</div>
								</div>
								
								<!-- Reset Button -->
								<button
									onclick={resetAdvancedSettings}
									class="w-full rounded-lg bg-ctp-surface2 px-4 py-2 text-xs font-medium text-ctp-text transition-colors hover:bg-ctp-overlay0"
								>
									Reset to Defaults
								</button>
							</div>
						{/if}
						
						<button 
							onclick={generateQRCode}
							disabled={!url}
							class="mt-6 w-full rounded-xl bg-ctp-blue px-6 py-3 font-medium text-ctp-base transition-colors hover:bg-ctp-sapphire focus:outline-none focus:ring-2 focus:ring-ctp-blue focus:ring-offset-2 focus:ring-offset-ctp-base disabled:cursor-not-allowed disabled:opacity-50"
						>
							Generate QR Code
						</button>
					</div>
				</div>

				<!-- QR Code Display Column -->
				<div class="{!isAdvancedMode ? 'mx-auto max-w-3xl' : ''}">
					{#if qrCodeDataUrl}
						<div class="rounded-2xl bg-ctp-surface0 p-6 shadow-lg sm:p-8">
							<h2 class="mb-4 text-center text-lg font-semibold text-ctp-text">Your QR Code</h2>
							
							<!-- QR Code Container -->
							<div class="mb-6 flex justify-center">
								<div 
									class="rounded-xl p-4"
									style="background-color: {isAdvancedMode ? lightColor : '#FFFFFF'};"
								>
									<img
										src={qrCodeDataUrl}
										alt="Generated QR Code"
										class="h-auto w-full max-w-[300px] sm:max-w-[400px]"
										style="image-rendering: -webkit-optimize-contrast; image-rendering: optimizeQuality;"
									/>
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="flex flex-col gap-3 sm:flex-row">
								<button 
									onclick={saveQRCode}
									class="flex-1 rounded-xl bg-ctp-green px-6 py-3 font-medium text-ctp-base transition-colors hover:bg-ctp-teal focus:outline-none focus:ring-2 focus:ring-ctp-green focus:ring-offset-2 focus:ring-offset-ctp-base"
								>
									<div class="flex items-center justify-center gap-2">
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										Download QR Code
									</div>
								</button>
								
								<button 
									onclick={() => { 
										url = ''; 
										qrCodeDataUrl = ''; 
										if (isAdvancedMode) {
											removeLogo();
										}
									}}
									class="flex-1 rounded-xl bg-ctp-surface2 px-6 py-3 font-medium text-ctp-text transition-colors hover:bg-ctp-overlay0 focus:outline-none focus:ring-2 focus:ring-ctp-surface2 focus:ring-offset-2 focus:ring-offset-ctp-base"
								>
									Clear
								</button>
							</div>
							
							<!-- Info Note -->
							<div class="mt-6 rounded-xl bg-ctp-surface1 p-4">
								<div class="flex items-start gap-3">
									<svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-ctp-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<div class="text-sm text-ctp-subtext0">
										{#if isAdvancedMode}
											<p class="mb-2">
												QR code generated at {qrSize}x{qrSize} resolution with custom settings.
											</p>
											<p class="text-xs">
												<strong>Error Correction:</strong> {errorCorrection === 'L' ? 'Low (7%)' : errorCorrection === 'M' ? 'Medium (15%)' : errorCorrection === 'Q' ? 'Quartile (25%)' : 'High (30%)'} • 
												<strong>Margin:</strong> {margin} modules
												{#if logoDataUrl} • <strong>Logo:</strong> {logoSize}% at {logoPosition}{/if}
											</p>
											{#if logoDataUrl}
												<p class="mt-2 text-xs text-ctp-yellow">
													⚠️ Logo added - please test scanning before production use
												</p>
											{/if}
										{:else}
											<p>
												QR code generated at 1024x1024 resolution for maximum quality. The saved image will be high-resolution and suitable for printing.
											</p>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</main>

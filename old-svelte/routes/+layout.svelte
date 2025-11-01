<script>
    import { onMount } from 'svelte';
    import '../app.css';

    /**
	 * @type {string|null}
	 */
    let selected = null; //= localStorage.getItem('theme') || 

    onMount(() => {
        if (typeof document !== 'undefined') {
            selected = localStorage.getItem('theme') || 'macchiato';
            localStorage.setItem('theme', selected);
            document.body.classList.add(`ctp-${selected}`);
        }
    });

    $: {
        if (selected !== null && typeof document !== 'undefined') {
            document.body.className = `ctp-${selected}`;
            localStorage.setItem('theme', selected);
        }
    }
</script>

<svelte:head>
	<title>Dev Tools</title>
</svelte:head>
<nav class="grid grid-cols-3 items-center bg-ctp-crust p-4 text-ctp-text">
    <div>
        <a href="/" class="font-bold">Home</a>
    </div>
    <div class="flex justify-center">
        <div class="border rounded border-ctp-overlay0">
            <select
                bind:value={selected}
                class="
                    focus:rounded-r 
                    focus:ring-pink 
                    focus:border-ctp-pink 
                    bg-ctp-overlay0 
                    w-full 
                    p-1 
                    text-ctp-text
                "
                name="colorscheme"
            >
                <option value="latte">latte</option>
                <option value="frappe">frappe</option>
                <option value="macchiato">macchiato</option>
                <option value="mocha">mocha</option>
            </select>
        </div>
    </div>
    <div class="flex justify-end items-center gap-4">
        <a href='https://ko-fi.com/I2I2TZ4OC' target='_blank'>
            <img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' alt='Buy Me a Coffee at ko-fi.com' />
        </a>
        <a href="https://github.com/adamjsturge/dev-tools" target="_blank" rel="noopener noreferrer">
            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
        </a>
    </div>
</nav>

<slot></slot>

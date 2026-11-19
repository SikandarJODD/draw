<script lang="ts">
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ScanIcon from '@lucide/svelte/icons/scan';
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { Button } from '#lib/components/ui/button/index.ts';
	import * as ButtonGroup from '#lib/components/ui/button-group/index.ts';

	type Props = {
		children: Snippet;
	};

	const MIN_ZOOM = 0.25;
	const MAX_ZOOM = 4;
	const ZOOM_STEP = 1.2;
	const ARTBOARD_WIDTH = 1200;
	const ARTBOARD_HEIGHT = 750;

	let { children }: Props = $props();
	let workspace: HTMLElement;
	let scale = $state(1);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let spacePressed = $state(false);
	let panPointer = $state<number | null>(null);
	let lastPointer = { x: 0, y: 0 };

	let zoomPercent = $derived(Math.round(scale * 100));

	function clampZoom(value: number): number {
		return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
	}

	function zoomTo(nextScale: number, clientX?: number, clientY?: number): void {
		const clampedScale = clampZoom(nextScale);
		if (clampedScale === scale) return;

		const bounds = workspace.getBoundingClientRect();
		const anchorX = (clientX ?? bounds.left + bounds.width / 2) - bounds.left - bounds.width / 2;
		const anchorY = (clientY ?? bounds.top + bounds.height / 2) - bounds.top - bounds.height / 2;
		const ratio = clampedScale / scale;

		offsetX = anchorX - (anchorX - offsetX) * ratio;
		offsetY = anchorY - (anchorY - offsetY) * ratio;
		scale = clampedScale;
	}

	function resetZoom(): void {
		scale = 1;
		offsetX = 0;
		offsetY = 0;
	}

	function fitArtboard(): void {
		const sidePadding = workspace.clientWidth <= 640 ? 24 : 48;
		const horizontalRoom = Math.max(1, workspace.clientWidth - sidePadding);
		const verticalRoom = Math.max(1, workspace.clientHeight - 192);

		scale = clampZoom(Math.min(horizontalRoom / ARTBOARD_WIDTH, verticalRoom / ARTBOARD_HEIGHT));
		offsetX = 0;
		offsetY = 0;
	}

	function handleWheel(event: WheelEvent): void {
		if (event.target instanceof Element && event.target.closest('button, input, [role="slider"]')) {
			return;
		}

		event.preventDefault();

		if (event.ctrlKey || event.metaKey) {
			zoomTo(scale * Math.exp(-event.deltaY * 0.002), event.clientX, event.clientY);
			return;
		}

		offsetX -= event.deltaX;
		offsetY -= event.deltaY;
	}

	function handlePointerDown(event: PointerEvent): void {
		if (!spacePressed || event.button !== 0) return;

		event.preventDefault();
		panPointer = event.pointerId;
		lastPointer = { x: event.clientX, y: event.clientY };
		workspace.setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent): void {
		if (event.pointerId !== panPointer) return;

		offsetX += event.clientX - lastPointer.x;
		offsetY += event.clientY - lastPointer.y;
		lastPointer = { x: event.clientX, y: event.clientY };
	}

	function endPan(event: PointerEvent): void {
		if (event.pointerId !== panPointer) return;
		panPointer = null;
	}

	function isInteractive(target: EventTarget | null): boolean {
		return (
			target instanceof HTMLElement &&
			(target.isContentEditable ||
				['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
		);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.code !== 'Space' || isInteractive(event.target)) return;
		event.preventDefault();
		spacePressed = true;
	}

	function handleKeyup(event: KeyboardEvent): void {
		if (event.code === 'Space') spacePressed = false;
	}

	const workspaceAttachment: Attachment<HTMLElement> = (node) => {
		workspace = node;
		const observer = new ResizeObserver(fitArtboard);
		observer.observe(node);
		return () => observer.disconnect();
	};
</script>

<svelte:window
	onkeydown={handleKeydown}
	onkeyup={handleKeyup}
	onblur={() => (spacePressed = false)}
/>

<main
	{@attach workspaceAttachment}
	class={['workspace', { 'space-panning': spacePressed, 'actively-panning': panPointer !== null }]}
	onwheel={handleWheel}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={endPan}
	onpointercancel={endPan}
>
	<div
		class="artboard-host"
		style:--camera-x={`${offsetX}px`}
		style:--camera-y={`${offsetY}px`}
		style:--camera-scale={scale}
	>
		<div class="artboard-frame"></div>
		<div class="drawing-layer">
			{@render children()}
		</div>
	</div>

	<div class="absolute bottom-3 left-3 z-40 sm:bottom-4 sm:left-4">
		<ButtonGroup.Root aria-label="Zoom controls" class="rounded-md border bg-background">
			<Button
				variant="ghost"
				size="icon"
				aria-label="Zoom out"
				title="Zoom out"
				disabled={scale <= MIN_ZOOM}
				onclick={() => zoomTo(scale / ZOOM_STEP)}
			>
				<MinusIcon />
			</Button>
			<Button
				variant="ghost"
				class="min-w-14 px-2 font-mono"
				aria-label="Reset zoom"
				title="Reset zoom"
				onclick={resetZoom}
			>
				{zoomPercent}%
			</Button>
			<Button
				variant="ghost"
				size="icon"
				aria-label="Zoom in"
				title="Zoom in"
				disabled={scale >= MAX_ZOOM}
				onclick={() => zoomTo(scale * ZOOM_STEP)}
			>
				<PlusIcon />
			</Button>
			<Button variant="ghost" aria-label="Fit artboard" title="Fit artboard" onclick={fitArtboard}>
				<ScanIcon />
				Fit
			</Button>
		</ButtonGroup.Root>
	</div>
</main>

<style>
	.workspace {
		position: relative;
		display: grid;
		min-height: 100svh;
		place-items: center;
		overflow: hidden;
		background: color-mix(in oklch, var(--muted) 78%, var(--background));
		overscroll-behavior: none;
	}

	.artboard-host {
		position: relative;
		width: 75rem;
		height: 46.875rem;
	}

	.artboard-frame,
	.drawing-layer :global(.drawing-canvas > svg) {
		transform: translate(var(--camera-x), var(--camera-y)) scale(var(--camera-scale));
		transform-origin: center;
		will-change: transform;
	}

	.artboard-frame,
	.drawing-layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.artboard-frame {
		border: 1px solid color-mix(in oklch, var(--foreground) 12%, transparent);
		border-radius: 1rem;
		background: #ffffff;
		box-shadow:
			0 1px 2px oklch(0 0 0 / 5%),
			0 8px 24px oklch(0 0 0 / 8%);
		pointer-events: none;
	}

	.drawing-layer :global(.drawing-canvas) {
		background: transparent;
		overflow: visible;
	}

	.drawing-layer :global([aria-label='Drawing tools']) {
		position: fixed;
		bottom: 1rem;
	}

	.space-panning {
		cursor: grab;
	}

	.space-panning .drawing-layer :global(.drawing-canvas > svg) {
		pointer-events: none;
	}

	.actively-panning {
		cursor: grabbing;
		user-select: none;
	}
</style>

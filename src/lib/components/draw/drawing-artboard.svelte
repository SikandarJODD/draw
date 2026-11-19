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
	let { children }: Props = $props();
	let workspace: HTMLElement;
	let zoomControls: HTMLElement;
	let scale = $state(1);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let zoomLeft = $state(12);
	let zoomTop = $state(12);
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
		resetZoom();
	}

	function handleWheel(event: WheelEvent): void {
		if (!(event.target instanceof Element) || !event.target.closest('.artboard-viewport')) return;

		event.preventDefault();

		if (event.ctrlKey || event.metaKey) {
			zoomTo(scale * Math.exp(-event.deltaY * 0.002), event.clientX, event.clientY);
			return;
		}

		offsetX -= event.deltaX;
		offsetY -= event.deltaY;
	}

	function handlePointerDown(event: PointerEvent): void {
		if (
			!spacePressed ||
			event.button !== 0 ||
			!(event.target instanceof Element) ||
			!event.target.closest('.artboard-viewport')
		) {
			return;
		}

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
		let toolbarObserver: ResizeObserver | undefined;
		let drawingToolbar: HTMLElement | null = null;
		let positionZoomControls: (() => void) | undefined;
		let animationFrame = requestAnimationFrame(() => {
			const toolbar = node.querySelector<HTMLElement>('[aria-label="Drawing tools"]');
			if (!toolbar) return;
			drawingToolbar = toolbar;

			const updatePosition = () => {
				const bounds = toolbar.getBoundingClientRect();
				zoomLeft = Math.max(12, bounds.left - zoomControls.offsetWidth - 8);
				zoomTop = bounds.top;
			};
			positionZoomControls = updatePosition;

			toolbarObserver = new ResizeObserver(updatePosition);
			toolbarObserver.observe(toolbar);
			toolbarObserver.observe(zoomControls);
			window.addEventListener('resize', updatePosition);
			toolbar.addEventListener('animationend', updatePosition);
			updatePosition();

			animationFrame = requestAnimationFrame(() => {
				updatePosition();
			});
		});

		return () => {
			cancelAnimationFrame(animationFrame);
			toolbarObserver?.disconnect();
			if (positionZoomControls) {
				window.removeEventListener('resize', positionZoomControls);
				drawingToolbar?.removeEventListener('animationend', positionZoomControls);
			}
		};
	};

	const zoomControlsAttachment: Attachment<HTMLElement> = (node) => {
		zoomControls = node;
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
		class="artboard-viewport"
		style:--camera-x={`${offsetX}px`}
		style:--camera-y={`${offsetY}px`}
		style:--camera-scale={scale}
	>
		<div class="drawing-layer">
			{@render children()}
		</div>
	</div>

	<div
		{@attach zoomControlsAttachment}
		class="zoom-controls"
		style:left={`${zoomLeft}px`}
		style:top={`${zoomTop}px`}
	>
		<ButtonGroup.Root aria-label="Zoom controls" class="rounded-lg border bg-background">
			<Button
				variant="ghost"
				size="icon-lg"
				aria-label="Zoom out"
				title="Zoom out"
				disabled={scale <= MIN_ZOOM}
				onclick={() => zoomTo(scale / ZOOM_STEP)}
			>
				<MinusIcon />
			</Button>
			<Button
				variant="ghost"
				size="lg"
				class="min-w-14 px-2 font-mono"
				aria-label="Reset zoom"
				title="Reset zoom"
				onclick={resetZoom}
			>
				{zoomPercent}%
			</Button>
			<Button
				variant="ghost"
				size="icon-lg"
				aria-label="Zoom in"
				title="Zoom in"
				disabled={scale >= MAX_ZOOM}
				onclick={() => zoomTo(scale * ZOOM_STEP)}
			>
				<PlusIcon />
			</Button>
			<Button
				variant="ghost"
				size="lg"
				aria-label="Fit artboard"
				title="Fit artboard"
				onclick={fitArtboard}
			>
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

	.artboard-viewport {
		position: relative;
		width: min(88vw, 115.2vh, 75rem);
		aspect-ratio: 8 / 5;
		overflow: hidden;
		border: 1px solid color-mix(in oklch, var(--foreground) 12%, transparent);
		border-radius: 0.5rem;
		background: #ffffff;
		box-shadow:
			0 1px 2px oklch(0 0 0 / 5%),
			0 8px 24px oklch(0 0 0 / 8%);
	}

	.drawing-layer :global(.drawing-canvas > svg) {
		transform: translate(var(--camera-x), var(--camera-y)) scale(var(--camera-scale));
		transform-origin: center;
		will-change: transform;
	}

	.drawing-layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border-radius: inherit;
	}

	.drawing-layer :global(.drawing-canvas) {
		background: transparent;
		overflow: visible;
	}

	.drawing-layer :global([aria-label='Drawing tools']) {
		position: fixed;
		bottom: 1rem;
	}

	.zoom-controls {
		position: fixed;
		z-index: 40;
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

	@media (max-width: 40rem) {
		.artboard-viewport {
			width: min(94vw, 115.2vh);
		}
	}
</style>

import { BRIGHT_SPOT_LIMITS } from '@shared/dtos'

import type { BrightSpotImageInput } from '@shared/dtos'

/** Anything bigger is almost certainly not a phone photo. */
const MAX_INPUT_BYTES = 25 * 1024 * 1024

export class ImageError extends Error {}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
        reader.onerror = () => reject(new ImageError('That photo could not be read.'))
        reader.readAsDataURL(blob)
    })
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
    if ('createImageBitmap' in window) {
        try {
            // Respects the phone's rotation (EXIF) so portraits stay upright
            return await createImageBitmap(file, { imageOrientation: 'from-image' })
        } catch {
            // fall through to <img>
        }
    }
    const url = URL.createObjectURL(file)
    try {
        const img = new Image()
        img.src = url
        await img.decode()
        return img
    } catch {
        throw new ImageError('That file type is not supported. Try a JPEG or PNG.')
    } finally {
        URL.revokeObjectURL(url)
    }
}

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))

/**
 * Shrink a picked photo in the browser before upload: long side at most imageMaxSide px, saved as
 * JPEG, quality stepped down until it fits imageMaxBytes. Metadata (like GPS location) is dropped.
 */
export async function prepareImage(file: File): Promise<BrightSpotImageInput> {
    if (!file.type.startsWith('image/')) throw new ImageError('Pick a photo (JPEG or PNG).')
    if (file.size > MAX_INPUT_BYTES) throw new ImageError('That photo is too large. Try a smaller one.')

    const source = await decode(file)
    let scale = Math.min(1, BRIGHT_SPOT_LIMITS.imageMaxSide / Math.max(source.width, source.height))

    for (let attempt = 0; attempt < 4; attempt++) {
        const width = Math.max(1, Math.round(source.width * scale))
        const height = Math.max(1, Math.round(source.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new ImageError('That photo could not be read.')
        ctx.fillStyle = '#FFFFFF' // transparent PNGs get a white background in JPEG
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(source, 0, 0, width, height)

        for (const quality of [0.85, 0.75, 0.65]) {
            const blob = await toBlob(canvas, quality)
            if (blob && blob.size <= BRIGHT_SPOT_LIMITS.imageMaxBytes) {
                if ('close' in source) source.close()
                return { mime: 'image/jpeg', data: await blobToBase64(blob), width, height }
            }
        }
        scale *= 0.75
    }
    throw new ImageError('That photo is too large. Try a smaller one.')
}

import Dialog from '@kozy-dozy/ui/Dialog'
import { useState } from 'react'
import styled from 'styled-components'

import useBrightSpotImage from './useBrightSpotImage'

import type { BrightSpotDto } from '@shared/dtos'

/** panel: full width of the desktop panel. thumb: small square on the Bright Spots page. */
type Variant = 'panel' | 'thumb'

const Trigger = styled.button<{ $variant: Variant }>`
    display: block;
    flex: none;
    padding: 0;
    border: 0;
    background: ${({ theme }) => theme.colors.bg.muted};
    border-radius: ${({ theme }) => theme.radius.md};
    overflow: hidden;
    cursor: zoom-in;
    width: ${({ $variant }) => ($variant === 'panel' ? '100%' : '56px')};
    height: ${({ $variant }) => ($variant === 'panel' ? '150px' : '56px')};

    img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primary};
        outline-offset: 2px;
    }
`

const Big = styled.figure`
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};

    img {
        display: block;
        max-width: 100%;
        max-height: 75vh;
        margin: 0 auto;
        border-radius: ${({ theme }) => theme.radius.md};
        object-fit: contain;
    }
    figcaption {
        font-size: ${({ theme }) => theme.fontSize.lg};
        color: ${({ theme }) => theme.colors.text.primary};
        text-align: center;
    }
`

/** The spot's photo, if it has one. Click to see it large. Renders nothing without a photo. */
export default function BrightSpotPhoto({ spot, variant }: { spot: BrightSpotDto; variant: Variant }) {
    const src = useBrightSpotImage(spot)
    const [open, setOpen] = useState(false)

    if (!spot.image) return null

    // Wide enough for a landscape photo, never wider than the screen
    const width = Math.min(900, Math.round(window.innerWidth * 0.92))

    return (
        <>
            <Trigger $variant={variant} type="button" aria-label={`See photo larger: ${spot.text}`} onClick={() => src && setOpen(true)}>
                {src && <img alt="" src={src} />}
            </Trigger>
            <Dialog isOpen={open} width={width} onClose={() => setOpen(false)} onRequestClose={() => setOpen(false)}>
                <Big>
                    {src && <img alt={spot.text} src={src} />}
                    <figcaption>{spot.text}</figcaption>
                </Big>
            </Dialog>
        </>
    )
}

/**
 * Steady brand spinner icon: the still-water mark from the logo. Registered once at bootstrap via
 * `configureSpinnerIcon`; the shared `@kozy-dozy/ui` Spinner provides the rotation, so this only
 * draws the icon (30px, the size the shared Spinner expects).
 */
export default function BrandSpinnerIcon() {
    return (
        <svg width={30} height={30} viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="16" fill="#2C6170" />
            <path d="M7 18c3-3 6-3 9 0s6 3 9 0" stroke="#E3C9A0" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
    )
}

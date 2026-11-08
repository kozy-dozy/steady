import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { trackPageView } from '@/utils/analytics/googleAnalytics'

export default function GoogleAnalytics() {
    const location = useLocation()

    useEffect(() => {
        const path = location.pathname + location.search
        trackPageView(path)
    }, [location])

    return null
}

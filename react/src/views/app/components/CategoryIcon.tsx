import {
    LuActivity,
    LuBaby,
    LuBriefcase,
    LuCar,
    LuCircleDot,
    LuCompass,
    LuGlobe,
    LuGraduationCap,
    LuHeart,
    LuHouse,
    LuMessageCircle,
    LuMoon,
    LuSun,
    LuUser,
    LuUsers,
    LuWallet,
} from 'react-icons/lu'

import type { CategoryIcon as IconName } from '@shared/dtos'
import type { IconType } from 'react-icons'

const ICONS: Record<IconName, IconType> = {
    LuBriefcase,
    LuWallet,
    LuBaby,
    LuHeart,
    LuUsers,
    LuActivity,
    LuCompass,
    LuHouse,
    LuMessageCircle,
    LuUser,
    LuGlobe,
    LuCircleDot,
    LuCar,
    LuGraduationCap,
    LuSun,
    LuMoon,
}

export default function CategoryIcon({ name, size = 18, color }: { name: IconName; size?: number; color?: string }) {
    const Icon = ICONS[name] ?? LuCircleDot
    return <Icon size={size} color={color} aria-hidden="true" />
}

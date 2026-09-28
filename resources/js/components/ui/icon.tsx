import type { MeyaIcon } from '@/components/meya-icons';

interface IconProps {
    iconNode?: MeyaIcon | null;
    className?: string;
}

export function Icon({ iconNode: IconComponent, className }: IconProps) {
    if (!IconComponent) {
        return null;
    }

    return <IconComponent className={className} />;
}

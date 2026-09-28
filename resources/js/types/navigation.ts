import type { InertiaLinkProps } from '@inertiajs/react';
import type { MeyaIcon } from '@/components/meya-icons';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: MeyaIcon | null;
    isActive?: boolean;
};

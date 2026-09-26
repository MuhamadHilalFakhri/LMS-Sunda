import type { AdminPageProps } from '@/pages/admin/types';
import { useAdminPageState } from '@/pages/admin/use-admin-page-state';
import { createAdminContentActions } from '@/pages/admin/use-admin-content-actions';
import { createAdminNavigationActions } from '@/pages/admin/use-admin-navigation-actions';
import { createAdminUserActions } from '@/pages/admin/use-admin-user-actions';

export function useAdminPageModel(props: AdminPageProps) {
    const state = useAdminPageState(props);
    return {
        ...state,
        ...createAdminContentActions(state),
        ...createAdminNavigationActions(state),
        ...createAdminUserActions(state),
    };
}

export type AdminPageModel = ReturnType<typeof useAdminPageModel>;

import type { AdminPageState } from '@/pages/admin/use-admin-page-state';
import { createAdminClassActions } from '@/pages/admin/use-admin-class-actions';
import { createAdminMaterialActions } from '@/pages/admin/use-admin-material-actions';
import { createAdminAssessmentActions } from '@/pages/admin/use-admin-assessment-actions';

export function createAdminContentActions(state: AdminPageState) {
    return {
        ...createAdminClassActions(state),
        ...createAdminMaterialActions(state),
        ...createAdminAssessmentActions(state),
    };
}

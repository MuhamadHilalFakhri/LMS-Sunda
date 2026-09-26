import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { t } from '@/lib/ui-language';
import type { AdminUser, Field } from '@/pages/admin/types';
import type { AdminPageState } from '@/pages/admin/use-admin-page-state';

const accountFields: Field[] = [
    { name: 'name', label: 'Nama lengkap', required: true },
    {
        name: 'email',
        label: 'Alamat email',
        type: 'email',
        required: true,
    },
    {
        name: 'role',
        label: 'Peran akun',
        type: 'select',
        required: true,
        options: [
            { value: 'pelajar', label: 'Pelajar' },
            { value: 'admin', label: 'Admin' },
        ],
    },
];

function showRequestError(errors: Record<string, string>, fallback: string) {
    const message = Object.values(errors)[0] ?? fallback;
    toast.error(t(message));
}

export function createAdminUserActions(state: AdminPageState) {
    const { setModal, setDeleting } = state;

    const openUser = (user?: AdminUser) => {
        const fields = user?.is_self
            ? accountFields.filter((field) => field.name !== 'role')
            : accountFields;

        setModal({
            title: user ? 'Ubah akun pengguna' : 'Buat akun pengguna',
            description: user
                ? 'Perbarui nama, email, dan peran akun ini.'
                : 'Akun dibuat aktif dan perlu memverifikasi email sebelum dapat membuka fitur belajar.',
            url: user ? `/admin/users/${user.id}` : '/admin/users',
            method: user ? 'put' : 'post',
            fields: user
                ? fields
                : [
                      ...fields,
                      {
                          name: 'password',
                          label: 'Kata sandi awal',
                          type: 'password',
                          required: true,
                          hint: 'Minimal 8 karakter. Pengguna dapat mengubahnya lewat tautan reset kata sandi.',
                      },
                      {
                          name: 'password_confirmation',
                          label: 'Ulangi kata sandi awal',
                          type: 'password',
                          required: true,
                      },
                  ],
            values: user
                ? {
                      name: user.name,
                      email: user.email,
                      role: user.role,
                  }
                : { role: 'pelajar' },
            silentSuccess: true,
            successMessage: user
                ? 'Data pengguna berhasil diperbarui.'
                : 'Akun pengguna berhasil dibuat.',
        });
    };

    const updateUserStatus = (user: AdminUser, isActive: boolean) => {
        router.patch(
            `/admin/users/${user.id}/status`,
            { is_active: isActive },
            {
                preserveScroll: true,
                onError: (errors) =>
                    showRequestError(errors, 'Status akun gagal diperbarui.'),
            },
        );
    };

    const sendPasswordReset = (user: AdminUser) => {
        router.post(
            `/admin/users/${user.id}/password-reset`,
            {},
            {
                preserveScroll: true,
                onError: (errors) =>
                    showRequestError(errors, 'Tautan reset gagal dikirim.'),
            },
        );
    };

    const sendVerification = (user: AdminUser) => {
        router.post(
            `/admin/users/${user.id}/verification`,
            {},
            {
                preserveScroll: true,
                onError: (errors) =>
                    showRequestError(
                        errors,
                        'Tautan verifikasi gagal dikirim.',
                    ),
            },
        );
    };

    const confirmDeleteUser = (user: AdminUser) => {
        setDeleting({
            type: 'users',
            id: user.id,
            label: `akun ${user.name}`,
            successMessage:
                'Akun pengguna dan data aktivitas terkait berhasil dihapus.',
            description:
                'Penghapusan akun tidak dapat dibatalkan. Progres, percobaan, materi tersimpan, dan riwayat tutor milik pengguna ini juga akan dihapus.',
        });
    };

    return {
        openUser,
        updateUserStatus,
        sendPasswordReset,
        sendVerification,
        confirmDeleteUser,
    };
}

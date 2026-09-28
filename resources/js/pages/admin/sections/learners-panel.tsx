import { router } from '@inertiajs/react';
import {
    BadgeCheck,
    BookOpenCheck,
    CircleAlert,
    GraduationCap,
    KeyRound,
    MailCheck,
    MoreHorizontal,
    Pencil,
    ShieldCheck,
    Trash2,
    UserRoundCheck,
    UserRoundX,
    Users,
} from '@/components/meya-icons';
import { t } from '@/lib/ui-language';
import { Button } from '@/components/ui/button';
import PaginationControls from '@/components/pagination-controls';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty } from '@/pages/admin/common-ui';
import { SearchBar } from '@/pages/admin/search-bar';
import type { AdminPageModel } from '@/pages/admin/use-admin-page-model';

export function LearnersPanel({ model }: { model: AdminPageModel }) {
    const {
        users,
        usersPagination,
        query,
        setQuery,
        openUser,
        updateUserStatus,
        sendPasswordReset,
        sendVerification,
        confirmDeleteUser,
    } = model;

    return (
        <section className="mt-8 space-y-5">
            <SearchBar
                query={query}
                setQuery={setQuery}
                placeholder="Cari nama, email, atau peran pengguna..."
                onSubmit={(event) => {
                    event.preventDefault();
                    router.get(
                        '/admin',
                        {
                            section: 'learners',
                            q: query.trim() || undefined,
                            learners_page: 1,
                        },
                        {
                            preserveState: true,
                            preserveScroll: true,
                            replace: true,
                            only: ['users', 'usersPagination'],
                        },
                    );
                }}
            />

            <div className="surface overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                    <div>
                        <h2 className="font-semibold">{t('Akun pengguna')}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Kelola peran, status akun, verifikasi email, dan akses kata sandi.',
                            )}{' '}
                            · {usersPagination.total} {t('akun')}
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        <Users className="size-4" />
                        {t('Termasuk admin dan pelajar')}
                    </span>
                </div>

                {users.length ? (
                    <>
                        <div className="grid gap-3 p-4 xl:grid-cols-2">
                            {users.map((user) => (
                                <article
                                    key={user.id}
                                    className="rounded-2xl border bg-card p-4 transition-colors hover:border-[#c8c3f8] sm:p-5"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#efedff] font-bold text-[#493ee5]">
                                            {user.name
                                                .slice(0, 1)
                                                .toLocaleUpperCase('id')}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-bold">
                                                {user.name}
                                                {user.is_self && (
                                                    <span className="ml-2 text-xs font-medium text-muted-foreground">
                                                        {t('Akun Anda')}
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {user.email}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                                                    {user.role === 'admin' ? (
                                                        <ShieldCheck className="size-3.5 text-[#493ee5]" />
                                                    ) : (
                                                        <GraduationCap className="size-3.5 text-[#493ee5]" />
                                                    )}
                                                    {t(
                                                        user.role === 'admin'
                                                            ? 'Admin'
                                                            : 'Pelajar',
                                                    )}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}
                                                >
                                                    {user.is_active ? (
                                                        <UserRoundCheck className="size-3.5" />
                                                    ) : (
                                                        <UserRoundX className="size-3.5" />
                                                    )}
                                                    {t(
                                                        user.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif',
                                                    )}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    {user.email_verified_at ? (
                                                        <BadgeCheck className="size-3.5 text-emerald-700" />
                                                    ) : (
                                                        <CircleAlert className="size-3.5 text-amber-700" />
                                                    )}
                                                    {t(
                                                        user.email_verified_at
                                                            ? 'Email terverifikasi'
                                                            : 'Email belum diverifikasi',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-10 shrink-0"
                                                    aria-label={`${t('Tindakan untuk')} ${user.name}`}
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-60"
                                            >
                                                <DropdownMenuLabel>
                                                    {t('Kelola akun')}
                                                </DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onSelect={() =>
                                                        openUser(user)
                                                    }
                                                >
                                                    <Pencil />{' '}
                                                    {t('Ubah data dan peran')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={() =>
                                                        sendPasswordReset(user)
                                                    }
                                                >
                                                    <KeyRound />{' '}
                                                    {t(
                                                        'Kirim tautan reset kata sandi',
                                                    )}
                                                </DropdownMenuItem>
                                                {!user.email_verified_at && (
                                                    <DropdownMenuItem
                                                        onSelect={() =>
                                                            sendVerification(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        <MailCheck />{' '}
                                                        {t(
                                                            'Kirim ulang verifikasi email',
                                                        )}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    disabled={user.is_self}
                                                    onSelect={() =>
                                                        updateUserStatus(
                                                            user,
                                                            !user.is_active,
                                                        )
                                                    }
                                                >
                                                    {user.is_active ? (
                                                        <UserRoundX />
                                                    ) : (
                                                        <UserRoundCheck />
                                                    )}
                                                    {t(
                                                        user.is_active
                                                            ? 'Nonaktifkan akun'
                                                            : 'Aktifkan akun',
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    disabled={user.is_self}
                                                    onSelect={() =>
                                                        confirmDeleteUser(user)
                                                    }
                                                >
                                                    <Trash2 /> {t('Hapus akun')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
                                        {user.role === 'pelajar' ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <BookOpenCheck className="size-3.5" />
                                                {user.completed}{' '}
                                                {t('pelajaran selesai')}
                                                <span aria-hidden="true">
                                                    ·
                                                </span>
                                                {user.attempts}{' '}
                                                {t('percobaan latihan')}
                                            </span>
                                        ) : (
                                            <span>
                                                {t('Akun pengelola Sawala')}
                                            </span>
                                        )}
                                        <span>
                                            {t('Bergabung')}{' '}
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <PaginationControls
                            pagination={usersPagination}
                            preserveScroll
                        />
                    </>
                ) : (
                    <div className="p-5">
                        <Empty
                            icon={Users}
                            title={
                                query
                                    ? 'Pengguna tidak ditemukan'
                                    : 'Belum ada akun pengguna'
                            }
                            detail={
                                query
                                    ? 'Coba nama, email, atau peran lain.'
                                    : 'Buat akun baru untuk menambahkan pelajar atau admin.'
                            }
                            action={
                                !query && (
                                    <Button
                                        onClick={() => openUser()}
                                        className="gap-2"
                                    >
                                        <Users className="size-4" />{' '}
                                        {t('Buat pengguna')}
                                    </Button>
                                )
                            }
                        />
                    </div>
                )}
            </div>
        </section>
    );
}

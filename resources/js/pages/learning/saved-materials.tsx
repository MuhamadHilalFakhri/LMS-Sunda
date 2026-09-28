import PaginationControls, {
    type PaginationMeta,
} from '@/components/pagination-controls';
import { t } from '@/lib/ui-language';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, Bookmark, Layers3, Search } from '@/components/meya-icons';
import { useState, type FormEvent } from 'react';
import { ModuleSaveButton } from '@/pages/learning/module-save-button';

type SavedItem = {
    id: number;
    type: string;
    title: string | null;
    body: string | null;
    latin: string | null;
    sundanese: string | null;
    translation: string | null;
    lesson_id: number;
    lesson_title: string;
    path_title: string;
    saved_at: string;
};

type SavedModule = {
    id: number;
    title: string;
    description: string | null;
    path_slug: string;
    path_title: string;
    lesson_count: number | string;
    completed_count: number | string;
    saved_at: string;
};

type Props = {
    items: SavedItem[];
    modules: SavedModule[];
    search: string;
    kind: 'modules' | 'materials';
    counts: { modules: number; materials: number };
    modulesPagination: PaginationMeta;
    materialsPagination: PaginationMeta;
};

export default function SavedMaterialsPage({
    items,
    modules,
    search,
    kind,
    counts,
    modulesPagination,
    materialsPagination,
}: Props) {
    const [activeKind, setActiveKind] = useState(kind);
    const [query, setQuery] = useState(search);
    const isModuleList = activeKind === 'modules';
    const pagination = isModuleList ? modulesPagination : materialsPagination;
    const activePagination = {
        ...pagination,
        previous: pageUrlForKind(pagination.previous, activeKind),
        next: pageUrlForKind(pagination.next, activeKind),
    };

    const changeKind = (nextKind: Props['kind']) => {
        setActiveKind(nextKind);
        const url = new URL(window.location.href);
        url.searchParams.set('kind', nextKind);
        url.searchParams.delete('page');
        url.searchParams.delete('modules_page');
        router.replace({
            url: `${url.pathname}${url.search}`,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const query = form.get('q');
        const value = typeof query === 'string' ? query.trim() : '';
        router.get(
            '/materi-tersimpan',
            { kind: activeKind, q: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t('Materi tersimpan')} />
            <p className="stitch-kicker">{t('PUSTAKA PRIBADI')}</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {t('Materi tersimpan')}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t(
                            'Simpan modul dan bagian materi untuk kembali belajar kapan saja.',
                        )}
                    </p>
                </div>
                <span className="rounded-full bg-[#efedff] px-3 py-2 text-xs font-bold text-[#493ee5]">
                    {pagination.total}{' '}
                    {t(isModuleList ? 'modul' : 'materi tersimpan')}
                </span>
            </div>

            <div
                className="mt-5 inline-flex rounded-xl border bg-card p-1"
                aria-label={t('Jenis simpanan')}
            >
                <button
                    type="button"
                    aria-pressed={isModuleList}
                    onClick={() => changeKind('modules')}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${isModuleList ? 'bg-[#efedff] text-[#493ee5]' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Layers3 className="size-4" />
                    {t('Modul')}
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs">
                        {counts.modules}
                    </span>
                </button>
                <button
                    type="button"
                    aria-pressed={!isModuleList}
                    onClick={() => changeKind('materials')}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${!isModuleList ? 'bg-[#efedff] text-[#493ee5]' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Bookmark className="size-4" />
                    {t('Bagian materi')}
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs">
                        {counts.materials}
                    </span>
                </button>
            </div>

            <form
                onSubmit={submitSearch}
                role="search"
                className="stitch-card mt-4 flex items-center gap-3 p-3"
            >
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                    name="q"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t(
                        isModuleList
                            ? 'Cari modul tersimpan'
                            : 'Cari materi tersimpan',
                    )}
                    className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#493ee5]"
                />
                <button className="btn-primary min-h-10 px-4" type="submit">
                    {t('Cari')}
                </button>
            </form>

            {isModuleList ? (
                modules.length ? (
                    <section className="stitch-card mt-5 overflow-hidden">
                        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                            {modules.map((module) => {
                                const lessonCount = Number(module.lesson_count);
                                const completedCount = Number(
                                    module.completed_count,
                                );
                                const percentage = lessonCount
                                    ? Math.round(
                                          (completedCount / lessonCount) * 100,
                                      )
                                    : 0;

                                return (
                                    <article
                                        key={module.id}
                                        className="stitch-card flex min-h-[220px] flex-col p-5"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                                <Layers3 className="size-5" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[11px] font-bold tracking-wide text-link uppercase">
                                                    {module.path_title}
                                                </p>
                                                <h2 className="mt-1 line-clamp-2 font-extrabold">
                                                    {module.title}
                                                </h2>
                                            </div>
                                            <ModuleSaveButton
                                                unitId={module.id}
                                                saved
                                                onUnsave={() => {
                                                    if (
                                                        modules.length === 1 &&
                                                        modulesPagination.from >
                                                            1
                                                    ) {
                                                        router.get(
                                                            '/materi-tersimpan',
                                                            {
                                                                kind: 'modules',
                                                                q:
                                                                    search ||
                                                                    undefined,
                                                                modules_page:
                                                                    Math.ceil(
                                                                        modulesPagination.from /
                                                                            12,
                                                                    ) - 1,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                                replace: true,
                                                            },
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                        {module.description && (
                                            <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
                                                {module.description}
                                            </p>
                                        )}
                                        <div className="mt-auto pt-4">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>
                                                    {completedCount} {t('dari')}{' '}
                                                    {lessonCount}{' '}
                                                    {t('materi selesai')}
                                                </span>
                                                <strong className="text-foreground">
                                                    {percentage}%
                                                </strong>
                                            </div>
                                            <div className="stitch-progress mt-2">
                                                <span
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                            <Link
                                                href={`/modul/${module.id}`}
                                                className="mt-4 inline-flex min-h-10 w-full items-center justify-between border-t pt-3 text-sm font-bold text-link"
                                            >
                                                {t('Buka modul')}
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                        <PaginationControls pagination={activePagination} />
                    </section>
                ) : (
                    <EmptySavedState
                        title={
                            search
                                ? 'Modul tidak ditemukan'
                                : 'Belum ada modul tersimpan'
                        }
                        detail={
                            search
                                ? 'Coba kata kunci lain untuk mencari modul.'
                                : 'Gunakan ikon penanda pada card modul untuk menyimpannya di sini.'
                        }
                    />
                )
            ) : items.length ? (
                <section className="stitch-card mt-5 overflow-hidden">
                    <div className="grid gap-3 p-4 md:grid-cols-2">
                        {items.map((item) => (
                            <article
                                key={item.id}
                                className="flex min-w-0 flex-col rounded-2xl border bg-card p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-[11px] font-bold tracking-wide text-link uppercase">
                                            {item.path_title} ·{' '}
                                            {item.lesson_title}
                                        </p>
                                        <h2 className="mt-1 line-clamp-2 font-extrabold">
                                            {item.title ||
                                                item.latin ||
                                                t('Materi belajar')}
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label={t(
                                            'Hapus dari materi tersimpan',
                                        )}
                                        onClick={() =>
                                            router.delete(
                                                `/materi-tersimpan/${item.id}`,
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#fff1f0] hover:text-[#a03a39]"
                                    >
                                        <Bookmark className="size-4" />
                                    </button>
                                </div>
                                {item.latin && (
                                    <p lang="su" className="mt-3 font-bold">
                                        {item.latin}
                                    </p>
                                )}
                                {item.sundanese && (
                                    <p
                                        className="sunda-script mt-1 text-2xl text-[#493ee5]"
                                        lang="su"
                                    >
                                        {item.sundanese}
                                    </p>
                                )}
                                {item.translation && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {item.translation}
                                    </p>
                                )}
                                {!item.latin &&
                                    !item.translation &&
                                    item.body && (
                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                            {item.body}
                                        </p>
                                    )}
                                <Link
                                    href={`/pelajaran/${item.lesson_id}`}
                                    className="mt-4 inline-flex min-h-9 items-center gap-2 border-t pt-3 text-xs font-bold text-link"
                                >
                                    {t('Buka pelajaran')}
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </article>
                        ))}
                    </div>
                    <PaginationControls pagination={activePagination} />
                </section>
            ) : (
                <EmptySavedState
                    title={
                        search
                            ? 'Materi tidak ditemukan'
                            : 'Belum ada materi tersimpan'
                    }
                    detail={
                        search
                            ? 'Coba kata kunci yang berbeda.'
                            : 'Tekan ikon simpan pada blok kosakata atau aksara di dalam pelajaran untuk menyimpannya di sini.'
                    }
                />
            )}
        </div>
    );
}

function pageUrlForKind(
    href: string | null,
    kind: Props['kind'],
): string | null {
    if (!href) return null;

    const url = new URL(href, 'http://sawala.local');
    url.searchParams.set('kind', kind);
    url.searchParams.delete(kind === 'modules' ? 'page' : 'modules_page');

    return `${url.pathname}${url.search}`;
}

function EmptySavedState({ title, detail }: { title: string; detail: string }) {
    return (
        <section className="stitch-card mt-5 p-8 text-center">
            <Bookmark className="mx-auto size-8 text-muted-foreground" />
            <h2 className="mt-3 font-extrabold">{t(title)}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {t(detail)}
            </p>
            <Link href="/dashboard" className="btn-primary mt-5">
                {t('Jelajahi pelajaran')}
            </Link>
        </section>
    );
}

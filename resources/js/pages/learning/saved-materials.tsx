import PaginationControls, { type PaginationMeta } from "@/components/pagination-controls";
import { t } from "@/lib/ui-language";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowRight, Bookmark, BookmarkX, Search } from "lucide-react";
import type { FormEvent } from "react";

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

export default function SavedMaterialsPage({
    items,
    search,
    pagination,
}: {
    items: SavedItem[];
    search: string;
    pagination: PaginationMeta;
}) {
    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const value = String(form.get("q") ?? "").trim();
        router.get("/materi-tersimpan", value ? { q: value } : {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t("Materi tersimpan")} />
            <p className="stitch-kicker">{t("PUSTAKA PRIBADI")}</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t("Materi tersimpan")}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{t("Kumpulkan kosakata dan contoh yang ingin Anda pelajari lagi.")}</p>
                </div>
                <span className="rounded-full bg-[#efedff] px-3 py-2 text-xs font-bold text-[#493ee5]">{pagination.total} {t("materi")}</span>
            </div>

            <form onSubmit={submitSearch} role="search" className="stitch-card mt-5 flex items-center gap-3 p-3">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input name="q" defaultValue={search} placeholder={t("Cari materi tersimpan") } className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#493ee5]" />
                <button className="btn-primary min-h-10 px-4" type="submit">{t("Cari")}</button>
            </form>

            {items.length ? (
                <section className="stitch-card mt-5 overflow-hidden">
                    <div className="grid gap-3 p-4 md:grid-cols-2">
                        {items.map((item) => (
                            <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border bg-card p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-link">{item.path_title} · {item.lesson_title}</p>
                                        <h2 className="mt-1 line-clamp-2 font-extrabold">{item.title || item.latin || t("Materi belajar")}</h2>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label={t("Hapus dari materi tersimpan")}
                                        onClick={() => router.delete(`/materi-tersimpan/${item.id}`, { preserveScroll: true })}
                                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-[#fff1f0] hover:text-[#a03a39]"
                                    >
                                        <BookmarkX className="size-4" />
                                    </button>
                                </div>
                                {item.latin && <p lang="su" className="mt-3 font-bold">{item.latin}</p>}
                                {item.sundanese && <p lang="su" className="sunda-script mt-1 text-2xl text-[#493ee5]">{item.sundanese}</p>}
                                {item.translation && <p className="mt-2 text-sm text-muted-foreground">{item.translation}</p>}
                                {!item.latin && !item.translation && item.body && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.body}</p>}
                                <Link href={`/pelajaran/${item.lesson_id}`} className="mt-4 inline-flex min-h-9 items-center gap-2 border-t pt-3 text-xs font-bold text-link">
                                    {t("Buka pelajaran")} <ArrowRight className="size-3.5" />
                                </Link>
                            </article>
                        ))}
                    </div>
                    <PaginationControls pagination={pagination} />
                </section>
            ) : (
                <section className="stitch-card mt-5 p-8 text-center">
                    <Bookmark className="mx-auto size-8 text-muted-foreground" />
                    <h2 className="mt-3 font-extrabold">{search ? t("Materi tidak ditemukan") : t("Belum ada materi tersimpan")}</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {search ? t("Coba kata kunci yang berbeda.") : t("Tekan ikon simpan pada blok kosakata atau aksara di dalam pelajaran untuk menyimpannya di sini.")}
                    </p>
                    <Link href="/dashboard" className="btn-primary mt-5">{t("Jelajahi pelajaran")}</Link>
                </section>
            )}
        </div>
    );
}

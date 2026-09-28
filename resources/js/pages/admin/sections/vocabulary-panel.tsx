import { t } from "@/lib/ui-language";
import { Link } from "@inertiajs/react";
import { BookOpen, Pencil } from '@/components/meya-icons';
import PaginationControls from "@/components/pagination-controls";
import { IconAction, Empty } from "@/pages/admin/common-ui";
import { SearchBar } from "@/pages/admin/search-bar";
import type { AdminPageModel } from "@/pages/admin/use-admin-page-model";

export function VocabularyPanel({ model }: { model: AdminPageModel }) {
    const { collectionPagination, section, query, setQuery, vocabularyBlocks, visibleVocabularyBlocks, openBlock, submitCollectionSearch } = model;
    return (
        <section className="mt-8 space-y-5">
                            <SearchBar query={query} setQuery={setQuery} placeholder={t("Cari kata, arti, aksara, atau ragam...")} onSubmit={(event) => submitCollectionSearch(event, "vocabulary")} />
                            <div className="surface overflow-hidden">
                                <div className="border-b px-5 py-4">
                                    <h2 className="font-semibold">{t("Entri kosakata & aksara")}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">{t("Entri berasal dari blok materi pada pelajaran.")}</p>
                                </div>
                                {vocabularyBlocks.length ? (
                                    <>
                                        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                                            {visibleVocabularyBlocks.map((block) => (
                                                <article key={block.id} className="flex min-h-44 flex-col rounded-xl border bg-card p-4 transition-colors hover:border-[#c8c3f8]">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t(block.type)}</span>
                                                            <h3 className="mt-1 truncate font-semibold">{block.latin || block.title || t("Entri tanpa judul")}</h3>
                                                        </div>
                                                        <IconAction label="Ubah entri" icon={Pencil} action={() => openBlock(block)} />
                                                    </div>
                                                    {block.sundanese && (
                                                        <p lang="su" className="sunda-script mt-2 text-2xl text-[#493ee5]">
                                                            {block.sundanese}
                                                        </p>
                                                    )}
                                                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{block.translation || t("Arti belum ditulis")}</p>
                                                    <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
                                                        <span className="min-w-0 truncate">
                                                            {block.lessonTitle} · {block.pathTitle}
                                                        </span>
                                                        {(block.region || block.register) && <span className="shrink-0">{[block.region, block.register].filter(Boolean).join(" · ")}</span>}
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                        <PaginationControls pagination={collectionPagination} preserveScroll />
                                    </>
                                ) : (
                                    <div className="p-5">
                                        <Empty
                                            icon={BookOpen}
                                            title={query ? "Tidak ada entri yang cocok" : "Belum ada kosakata atau aksara"}
                                            detail={query ? "Coba istilah pencarian lain." : "Tambahkan blok kosakata atau aksara pada pelajaran untuk melihatnya di sini."}
                                            action={
                                                !query && (
                                                    <Link href="/admin?section=paths" className="btn-secondary">
                                                        {t("Buka kelas belajar")}
                                                    </Link>
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </section>
    );
}

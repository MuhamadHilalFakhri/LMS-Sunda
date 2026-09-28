import { t } from "@/lib/ui-language";
import { Link } from "@inertiajs/react";
import { CaseSensitive, Pencil, Trash2 } from '@/components/meya-icons';
import PaginationControls from "@/components/pagination-controls";
import { IconAction, Empty } from "@/pages/admin/common-ui";
import { SearchBar } from "@/pages/admin/search-bar";
import type { AdminPageModel } from "@/pages/admin/use-admin-page-model";

export function CharactersPanel({ model }: { model: AdminPageModel }) {
    const { collectionPagination, section, query, setQuery, setDeleting, characterBlocks, visibleCharacterBlocks, openBlock, submitCollectionSearch } = model;
    return (
        <section className="mt-8 space-y-5">
                            <SearchBar query={query} setQuery={setQuery} placeholder={t("Cari aksara, latin, atau pelajaran...")} onSubmit={(event) => submitCollectionSearch(event, "characters")} />
                            <div className="surface overflow-hidden">
                                <div className="border-b px-5 py-4">
                                    <h2 className="font-semibold">{t("Daftar aksara")}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">{t("Kelola aksara melalui blok materi yang tersimpan pada pelajaran.")}</p>
                                </div>
                                {characterBlocks.length ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                                            {visibleCharacterBlocks.map((block) => (
                                                <article key={block.id} className="flex min-h-48 flex-col rounded-xl border bg-card p-4 transition-colors hover:border-[#c8c3f8]">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                                            {block.sundanese ? (
                                                                <span lang="su" className="sunda-script text-3xl">
                                                                    {block.sundanese}
                                                                </span>
                                                            ) : (
                                                                <CaseSensitive className="size-6" />
                                                            )}
                                                        </div>
                                                        <div className="flex shrink-0 items-center gap-0.5">
                                                            <IconAction label="Ubah aksara" icon={Pencil} action={() => openBlock(block)} />
                                                            <IconAction
                                                                label="Hapus aksara"
                                                                icon={Trash2}
                                                                danger
                                                                action={() =>
                                                                    setDeleting({
                                                                        type: "blocks",
                                                                        id: block.id,
                                                                        label: block.title || block.latin || "aksara",
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <h3 className="mt-3 truncate font-semibold">{block.title || block.latin || t("Tanpa nama")}</h3>
                                                    {block.title && block.latin && <p className="text-xs text-muted-foreground">{block.latin}</p>}
                                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{block.translation || t("Arti belum ditulis")}</p>
                                                    <p className="mt-auto truncate border-t pt-3 text-xs text-muted-foreground">
                                                        {block.pathTitle} · {block.lessonTitle}
                                                    </p>
                                                </article>
                                            ))}
                                        </div>
                                        <PaginationControls pagination={collectionPagination} preserveScroll />
                                    </>
                                ) : (
                                    <div className="p-5">
                                        <Empty
                                            icon={CaseSensitive}
                                            title={query ? "Tidak ada aksara yang cocok" : "Belum ada aksara Sunda"}
                                            detail={query ? "Coba kata pencarian lain." : "Tambahkan blok aksara pada pelajaran di kelas Aksara Sunda untuk mengisi kumpulan ini."}
                                            action={
                                                !query && (
                                                    <Link href="/admin?section=paths&path=aksara-sunda" className="btn-secondary">
                                                        {t("Buka kelas Aksara Sunda")}
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

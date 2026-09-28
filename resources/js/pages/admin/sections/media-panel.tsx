import { t } from "@/lib/ui-language";
import { Link } from "@inertiajs/react";
import { AudioLines, Pencil, Plus, Volume2 } from '@/components/meya-icons';
import { Button } from "@/components/ui/button";
import PaginationControls from "@/components/pagination-controls";
import { IconAction, Empty } from "@/pages/admin/common-ui";
import { SearchBar } from "@/pages/admin/search-bar";
import type { AdminPageModel } from "@/pages/admin/use-admin-page-model";

export function MediaPanel({ model }: { model: AdminPageModel }) {
    const { collectionPagination, mediaCounts, section, query, setQuery, mediaView, mediaBlocks, missingAudioBlocks, visibleMediaBlocks, visibleMissingAudioBlocks, openBlockAudio, submitCollectionSearch, changeMediaView } = model;
    return (
        <section className="mt-8 space-y-5">
                            <SearchBar query={query} setQuery={setQuery} placeholder={t("Cari audio berdasarkan kata atau pelajaran...")} onSubmit={(event) => submitCollectionSearch(event, "media")} />
                            <div className="surface overflow-hidden">
                                <div className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4">
                                    <div>
                                        <h2 className="font-semibold">{mediaView === "uploaded" ? t("Audio pelafalan") : t("Blok materi tanpa audio")}</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {mediaView === "uploaded" ? t("Audio tersimpan pada blok materi terkait.") : t("Pilih materi, lalu unggah file rekaman suara.")} ·{" "}
                                            {mediaCounts[mediaView]} {mediaView === "uploaded" ? t("audio") : t("materi")}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button variant={mediaView === "uploaded" ? "default" : "outline"} className="min-h-10" onClick={() => changeMediaView("uploaded")}>
                                            <Volume2 className="size-4" /> {t("Audio tersimpan")} · {mediaCounts.uploaded}
                                        </Button>
                                        <Button variant={mediaView === "missing" ? "default" : "outline"} className="min-h-10" onClick={() => changeMediaView("missing")}>
                                            <AudioLines className="size-4" /> {t("Materi tanpa audio")} · {mediaCounts.missing}
                                        </Button>
                                    </div>
                                </div>
                                {mediaView === "uploaded" ? (
                                    mediaBlocks.length ? (
                                        <>
                                            <div className="grid gap-3 p-4 xl:grid-cols-2">
                                                {visibleMediaBlocks.map((block) => (
                                                    <article key={block.id} className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-link">
                                                                <Volume2 className="size-5" />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <h3 className="truncate font-semibold">{block.latin || block.title || t("Audio materi")}</h3>
                                                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                                                    {block.lessonTitle} · {block.pathTitle}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
                                                            <audio controls preload="none" src={`/storage/${block.audio_path}`} className="h-10 max-w-[260px] min-w-0">
                                                                {t("Audio tidak tersedia.")}
                                                            </audio>
                                                            <IconAction label="Ganti audio" icon={Pencil} action={() => openBlockAudio(block)} />
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                            <PaginationControls pagination={collectionPagination} preserveScroll />
                                        </>
                                    ) : (
                                        <div className="p-5">
                                            <Empty
                                                icon={AudioLines}
                                                title={query ? "Audio tidak ditemukan" : "Belum ada audio"}
                                                detail={query ? "Coba pencarian lain." : "Gunakan tab Tambah audio untuk memilih materi yang akan diberi audio."}
                                                action={
                                                    !query && (
                                                        <Button variant="outline" onClick={() => openBlockAudio()}>
                                                            <Plus className="size-4" /> {t("Tambah audio")}
                                                        </Button>
                                                    )
                                                }
                                            />
                                        </div>
                                    )
                                ) : missingAudioBlocks.length ? (
                                    <>
                                        <div className="grid gap-3 p-4 md:grid-cols-2">
                                            {visibleMissingAudioBlocks.map((block) => (
                                                <article key={block.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border bg-card p-4">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-link">
                                                            <AudioLines className="size-5" />
                                                        </span>
                                                        <div className="min-w-0">
                                                            <h3 className="truncate font-semibold">{block.latin || block.title || t("Blok materi")}</h3>
                                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                                {block.lessonTitle} · {block.pathTitle}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" className="min-h-10 shrink-0" onClick={() => openBlockAudio(block)}>
                                                        <Plus className="size-4" /> {t("Tambah audio")}
                                                    </Button>
                                                </article>
                                            ))}
                                        </div>
                                        <PaginationControls pagination={collectionPagination} preserveScroll />
                                    </>
                                ) : (
                                    <div className="p-5">
                                        <Empty
                                            icon={AudioLines}
                                            title={query ? "Materi tanpa audio tidak ditemukan" : "Semua materi sudah memiliki audio"}
                                            detail={query ? "Coba kata pencarian lain." : "Belum ada blok materi lain yang perlu ditambahkan audio."}
                                            action={
                                                !query && (
                                                    <Link href="/admin?section=paths" className="btn-secondary">
                                                        {t("Kelola materi")}
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

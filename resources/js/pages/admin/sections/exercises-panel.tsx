import { t } from "@/lib/ui-language";
import { Link } from "@inertiajs/react";
import { ChevronRight, FileQuestion, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaginationControls from "@/components/pagination-controls";
import { IconAction, Empty } from "@/pages/admin/common-ui";
import { SearchBar } from "@/pages/admin/search-bar";
import type { AdminPageModel } from "@/pages/admin/use-admin-page-model";

export function ExercisesPanel({ model }: { model: AdminPageModel }) {
    const { collectionPagination, section, query, setQuery, setDeleting, allLessons, filteredExercises, visibleExercises, openExercise, openQuestion, openQuizBuilder, submitCollectionSearch } = model;
    return (
        <section className="mt-8 space-y-5">
                            <SearchBar query={query} setQuery={setQuery} placeholder={t("Cari judul latihan atau pelajaran...")} onSubmit={(event) => submitCollectionSearch(event, "exercises")} />
                            <div className="surface overflow-hidden">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                                    <div>
                                        <h2 className="font-semibold">{t("Latihan & kuis yang tersusun")}</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t("Kelola latihan dan kuis evaluasi untuk setiap pelajaran.")} · {collectionPagination.total} {t("aktivitas")}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" className="min-h-10" onClick={() => openExercise(undefined, null)}>
                                            <Plus className="size-4" /> {t("Tambah latihan")}
                                        </Button>
                                        <Button className="min-h-10 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openQuizBuilder()}>
                                            <Plus className="size-4" /> {t("Buat kuis")}
                                        </Button>
                                    </div>
                                </div>
                                {filteredExercises.length ? (
                                    <>
                                        <div className="space-y-3 p-4">
                                            {visibleExercises.map((exercise, index) => (
                                                <article key={exercise.id} className="rounded-xl border bg-card p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex min-w-0 items-start gap-3">
                                                            <span className="inline-flex h-8 shrink-0 items-center rounded-md bg-accent px-2 text-xs font-bold text-link">
                                                                No. {collectionPagination.from + index}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <h3 className="truncate font-semibold">{exercise.title}</h3>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {exercise.pathTitle} / {exercise.lessonTitle} · {exercise.questions?.length ?? 0} {t("soal")}
                                                                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                                                                        {t(exercise.kind === "quiz" ? "Kuis" : "Latihan")}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex shrink-0 gap-1">
                                                            <IconAction label="Ubah latihan" icon={Pencil} action={() => openExercise(exercise)} />
                                                            <IconAction
                                                                label="Hapus latihan"
                                                                icon={Trash2}
                                                                danger
                                                                action={() =>
                                                                    setDeleting({
                                                                        type: "exercises",
                                                                        id: exercise.id,
                                                                        label: exercise.title,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <details className="group mt-3 rounded-lg bg-secondary/60 px-3 py-2">
                                                        <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
                                                            <span className="flex items-center justify-between gap-3">
                                                                <span>
                                                                    {t("Lihat soal")} · {exercise.questions?.length ?? 0}
                                                                </span>
                                                                <ChevronRight className="size-4 rotate-90 transition-transform group-open:-rotate-90" />
                                                            </span>
                                                        </summary>
                                                        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto border-t pt-3 pr-1">
                                                            {exercise.questions?.length ? (
                                                                exercise.questions.map((question, index) => (
                                                                    <div key={question.id} className="flex items-center justify-between gap-3 rounded-md bg-card px-3 py-2 text-sm">
                                                                        <span className="min-w-0 truncate">
                                                                            {index + 1}. {question.prompt}
                                                                        </span>
                                                                        <IconAction label="Ubah soal" icon={Pencil} action={() => openQuestion(exercise, question)} />
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">{t("Belum ada soal")}</p>
                                                            )}
                                                        </div>
                                                        <Button variant="outline" className="mt-3 min-h-10" onClick={() => openQuestion(exercise)}>
                                                            <Plus className="size-4" /> {t("Tambah soal")}
                                                        </Button>
                                                    </details>
                                                </article>
                                            ))}
                                        </div>
                                        <PaginationControls pagination={collectionPagination} preserveScroll />
                                    </>
                                ) : (
                                    <div className="p-5">
                                        <Empty
                                            icon={FileQuestion}
                                            title={query ? "Aktivitas tidak ditemukan" : "Belum ada latihan atau kuis"}
                                            detail={query ? "Coba kata pencarian lain." : allLessons.length === 0 ? "Tambahkan pelajaran terlebih dahulu untuk membuat latihan atau kuis." : "Gunakan Tambah latihan untuk membuat latihan, atau Buat kuis untuk menyusun evaluasi beserta soalnya."}
                                            action={
                                                !query && allLessons.length === 0 && (
                                                    <Link href="/admin?section=paths" className="btn-secondary">
                                                        {t("Kelola pelajaran")}
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

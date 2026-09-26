import { t } from "@/lib/ui-language";
import { BookOpen, ChevronRight, FileText, LibraryBig, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPathArtwork from "@/components/admin-path-artwork";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Status } from "@/pages/admin/status";
import { labelStatus, statuses } from "@/pages/admin/form-fields";
import { Empty, CollectionPagination } from "@/pages/admin/common-ui";
import { LessonWorkspace } from "@/pages/admin/lesson-workspace";
import type { AdminPageModel } from "@/pages/admin/use-admin-page-model";
import { PathSelectionToolbar } from "@/pages/admin/sections/path-selection-toolbar";

export function PathsPanel({ model }: { model: AdminPageModel }) {
    const { paths, section, setSelectedUnitId, setSelectedLessonId, query, setQuery, lessonQuery, setLessonQuery, lessonPage, setLessonPage, statusFilter, setStatusFilter, setDeleting, filteredPaths, selectedPath, selectedUnit, lessonPageSize, matchingUnitLessons, visibleUnitLessons, selectedLesson, openPath, openUnit, openLesson, openBlock, openExercise, openQuestion, openQuizBuilder, goToPath } = model;
    return (
        <div className="mt-7 space-y-6">
                            <PathSelectionToolbar model={model} />
                            <div className="min-w-0 space-y-6">
                                {selectedPath ? (
                                    <>
                                        <section className="stitch-card overflow-hidden">
                                            <AdminPathArtwork path={selectedPath} />
                                            <div className="p-6">
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div>
                                                        <Status value={selectedPath.status} />
                                                        <h2 className="mt-3 text-2xl font-extrabold">{selectedPath.title}</h2>
                                                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{selectedPath.description || "Belum ada deskripsi kelas."}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openPath(selectedPath)}>
                                                            <Pencil className="size-4" /> {t("Ubah kelas")}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-[#b42335] hover:bg-[#fff1f2]"
                                                            onClick={() =>
                                                                setDeleting({
                                                                    type: "paths",
                                                                    id: selectedPath.id,
                                                                    label: selectedPath.title,
                                                                })
                                                            }
                                                        >
                                                            <Trash2 className="size-4" /> {t("Hapus")}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                        <section className="stitch-card overflow-hidden">
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                                                <div>
                                                    <h3 className="font-semibold">{t("Unit pembelajaran")}</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">{t("Pilih unit untuk mengatur pelajaran di dalamnya.")}</p>
                                                </div>
                                                <Button variant="outline" className="min-h-10" onClick={() => openUnit()}>
                                                    <Plus className="size-4" /> {t("Tambah unit")}
                                                </Button>
                                            </div>
                                            {selectedPath.units?.length && selectedUnit ? (
                                                <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,1.4fr)] lg:items-end">
                                                    <div>
                                                        <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                                            {t("Unit terpilih")} · {selectedPath.units.length} {t("unit")}
                                                        </p>
                                                        <Select
                                                            value={String(selectedUnit.id)}
                                                            onValueChange={(value) => {
                                                                setSelectedUnitId(Number(value));
                                                                setSelectedLessonId(null);
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-11 w-full bg-card">
                                                                <SelectValue placeholder={t("Pilih unit pembelajaran")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {selectedPath.units.map((unit) => (
                                                                    <SelectItem key={unit.id} value={String(unit.id)}>
                                                                        {unit.title} · {unit.lessons?.length ?? 0} {t("pelajaran")}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex min-h-11 items-center rounded-lg bg-secondary/70 px-3 text-sm text-muted-foreground">
                                                        <span className="truncate">{selectedUnit.description || t("Belum ada tujuan unit.")}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-5">
                                                    <Empty
                                                        icon={BookOpen}
                                                        title="Belum ada unit"
                                                        detail="Tambahkan unit untuk mulai menyusun urutan belajar."
                                                        action={
                                                            <Button variant="outline" onClick={() => openUnit()}>
                                                                {t("Tambah unit")}
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </section>
                                        {selectedUnit && (
                                            <section className="surface overflow-hidden">
                                                <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-5">
                                                    <div>
                                                        <p className="text-xs font-semibold text-muted-foreground">{t("UNIT TERPILIH")}</p>
                                                        <h3 className="mt-1 text-lg font-semibold">{selectedUnit.title}</h3>
                                                        <p className="mt-1 text-sm text-muted-foreground">{selectedUnit.description || "Belum ada tujuan unit."}</p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Status value={selectedUnit.status} />
                                                        <Button variant="outline" size="sm" onClick={() => openUnit(selectedUnit)}>
                                                            <Pencil className="size-4" /> {t("Ubah unit")}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-[#b42335] hover:bg-[#fff1f2]"
                                                            onClick={() =>
                                                                setDeleting({
                                                                    type: "units",
                                                                    id: selectedUnit.id,
                                                                    label: selectedUnit.title,
                                                                })
                                                            }
                                                        >
                                                            <Trash2 className="size-4" /> {t("Hapus")}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <h4 className="text-sm font-semibold">{t("Urutan pelajaran")}</h4>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {selectedUnit.lessons?.length ?? 0} {t("pelajaran")}
                                                            </p>
                                                        </div>
                                                        <Button variant="ghost" onClick={() => openLesson()} className="min-h-10 text-link">
                                                            <Plus className="size-4" /> {t("Tambah pelajaran")}
                                                        </Button>
                                                    </div>
                                                    {(selectedUnit.lessons?.length ?? 0) > 0 && (
                                                        <label className="relative mb-3 block">
                                                            <span className="sr-only">{t("Cari pelajaran")}</span>
                                                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                            <Input
                                                                value={lessonQuery}
                                                                onChange={(event) => setLessonQuery(event.target.value)}
                                                                placeholder={t("Cari pelajaran dalam unit...")}
                                                                className="h-10 bg-card pl-9"
                                                            />
                                                        </label>
                                                    )}
                                                    {matchingUnitLessons.length ? (
                                                        <div className="space-y-2">
                                                            {visibleUnitLessons.map((lesson, index) => (
                                                                <button
                                                                    key={lesson.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedLessonId(lesson.id)}
                                                                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selectedLesson?.id === lesson.id ? "border-[#493ee5] bg-[#f4f1ff]" : "hover:bg-secondary"}`}
                                                                >
                                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-card text-xs font-semibold">
                                                                        {(lessonPage - 1) * lessonPageSize + index + 1}
                                                                    </span>
                                                                    <span className="min-w-0 flex-1">
                                                                        <strong className="block truncate text-sm">{lesson.title}</strong>
                                                                        <span className="block text-xs text-muted-foreground">
                                                                            {t(labelStatus(lesson.status))} · {lesson.blocks?.length ?? 0} {t("blok ·")} {lesson.exercises?.length ?? 0}{" "}
                                                                            {t("latihan")}
                                                                        </span>
                                                                    </span>
                                                                    <ChevronRight className="size-4 shrink-0" />
                                                                </button>
                                                            ))}
                                                            <CollectionPagination
                                                                total={matchingUnitLessons.length}
                                                                page={lessonPage}
                                                                pageSize={lessonPageSize}
                                                                onPageChange={setLessonPage}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <Empty
                                                            icon={FileText}
                                                            title={selectedUnit.lessons?.length ? "Pelajaran tidak ditemukan" : "Belum ada pelajaran"}
                                                            detail={selectedUnit.lessons?.length ? "Coba kata pencarian lain." : "Buat pelajaran pertama untuk unit ini."}
                                                            action={
                                                                selectedUnit.lessons?.length ? undefined : (
                                                                    <Button variant="outline" onClick={() => openLesson()}>
                                                                        {t("Tambah pelajaran")}
                                                                    </Button>
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                        {selectedLesson && (
                                            <LessonWorkspace
                                                lesson={selectedLesson}
                                                openLesson={() => openLesson(selectedLesson)}
                                                openBlock={openBlock}
                                                openExercise={openExercise}
                                                openQuizBuilder={(lesson) => openQuizBuilder(lesson)}
                                                openQuestion={openQuestion}
                                                remove={setDeleting}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <Empty
                                        icon={LibraryBig}
                                        title={paths.length ? "Kelas tidak ditemukan" : "Belum ada kelas belajar"}
                                        detail={paths.length ? "Ubah pencarian atau filter status untuk melihat kelas lain." : "Buat kelas pertama Anda untuk memulai."}
                                        action={
                                            paths.length ? (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setQuery("");
                                                        setStatusFilter("all");
                                                    }}
                                                >
                                                    {t("Hapus filter")}
                                                </Button>
                                            ) : (
                                                <Button onClick={() => openPath()}>{t("Buat kelas")}</Button>
                                            )
                                        }
                                    />
                                )}
                            </div>
                        </div>
    );
}

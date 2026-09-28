import { t } from "@/lib/ui-language";
import { Search } from '@/components/meya-icons';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statuses } from "@/pages/admin/form-fields";
import type { AdminPageModel } from "@/pages/admin/use-admin-page-model";

export function PathSelectionToolbar({ model }: { model: AdminPageModel }) {
    const { paths, query, setQuery, statusFilter, setStatusFilter, filteredPaths, selectedPath, goToPath } = model;
    return (
                <section className="stitch-card p-4 md:p-5" aria-label={t("Pilih kelas belajar")}>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <h2 className="text-sm font-extrabold">{t("Pilih kelas yang dikelola")}</h2>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {paths.length} {t("kelas tersedia")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_minmax(240px,1.15fr)]">
                                            <label className="relative flex min-w-0 flex-col gap-1.5">
                                                <span className="text-xs font-semibold text-muted-foreground">{t("Cari kelas")}</span>
                                                <Search className="absolute top-[2.625rem] left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Nama kelas...")} className="h-11 bg-card pl-9" />
                                            </label>
                                            <div className="flex min-w-0 flex-col gap-1.5">
                                                <span className="text-xs font-semibold text-muted-foreground">{t("Status kelas")}</span>
                                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                    <SelectTrigger className="h-11 w-full bg-card" aria-label={t("Filter status kelas")}>
                                                        <SelectValue placeholder={t("Semua status")} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">{t("Semua status")}</SelectItem>
                                                        {statuses.map((item) => (
                                                            <SelectItem key={item.value} value={item.value}>
                                                                {t(item.label)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex min-w-0 flex-col gap-1.5">
                                                <span className="text-xs font-semibold text-muted-foreground">{t("Kelas terpilih")}</span>
                                                {filteredPaths.length ? (
                                                    <Select
                                                        value={selectedPath?.slug ?? ""}
                                                        onValueChange={(slug) => {
                                                            const path = paths.find((item) => item.slug === slug);
                                                            if (path) goToPath(path);
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-11 w-full bg-card" aria-label={t("Kelas terpilih")}>
                                                            <SelectValue placeholder={t("Pilih kelas belajar")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {filteredPaths.map((path) => {
                                                                const lessonCount = (path.units ?? []).reduce((count, unit) => count + (unit.lessons?.length ?? 0), 0);
                                                                return (
                                                                    <SelectItem key={path.id} value={path.slug}>
                                                                        {path.title} · {path.units?.length ?? 0} {t("unit ·")} {lessonCount} {t("pelajaran")}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="flex h-11 items-center rounded-xl border border-dashed px-3 text-sm text-muted-foreground">
                                                        {t("Tidak ada kelas yang cocok. Ubah kata kunci atau status.")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>
    );
}

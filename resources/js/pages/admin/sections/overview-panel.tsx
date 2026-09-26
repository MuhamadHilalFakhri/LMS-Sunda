import { t } from "@/lib/ui-language";
import { Link } from "@inertiajs/react";
import { ArrowRight, BookOpen, ChevronRight, LibraryBig, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Status } from "@/pages/admin/status";
import { Empty } from "@/pages/admin/common-ui";
import type { AdminPageModel } from "@/pages/admin/use-admin-page-model";

export function OverviewPanel({ model }: { model: AdminPageModel }) {
    const { paths, learnerCount, section, openPath, goToPath, draftCount, publishedCount } = model;
    return (
        <div className="mt-7 space-y-7">
                            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#493ee5] to-[#8573ee] p-7 text-white md:p-8">
                                <div aria-hidden="true" className="absolute top-1/2 right-8 hidden -translate-y-1/2 items-center gap-3 lg:flex">
                                    {["ᮘ", "ᮞ", "ᮔ"].map((glyph, index) => (
                                        <span
                                            key={index}
                                            lang="su"
                                            className={`sunda-script flex size-20 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-5xl text-white shadow-lg ${index === 1 ? "-translate-y-5" : ""}`}
                                        >
                                            {glyph}
                                        </span>
                                    ))}
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[11px] font-extrabold tracking-widest text-white/75">{t("SAWALA · STUDIO KONTEN")}</p>
                                    <h2 className="mt-3 max-w-xl text-2xl leading-tight font-extrabold md:text-3xl">{t("Kelola pengalaman belajar yang bermakna.")}</h2>
                                    <p className="mt-2 max-w-lg text-sm leading-6 text-white/85">{t("Susun kelas, lengkapi materi, dan tinjau progres pelajar dari satu ruang kerja.")}</p>
                                    <Link
                                        href="/admin?section=paths"
                                        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-extrabold text-[#493ee5]"
                                    >
                                        {t("Kelola kelas belajar")} <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="stitch-card p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">{t("Kelas belajar")}</span>
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                            <LibraryBig className="size-5" />
                                        </span>
                                    </div>
                                    <p className="mt-5 text-3xl font-extrabold">{paths.length}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {paths.filter((path) => path.status === "published").length} {t("terbuka untuk pelajar")}
                                    </p>
                                </div>
                                <div className="stitch-card p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">{t("Pelajaran siap tayang")}</span>
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#006c4a]">
                                            <BookOpen className="size-5" />
                                        </span>
                                    </div>
                                    <p className="mt-5 text-3xl font-extrabold">{publishedCount}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {draftCount} {t("masih draf atau ditinjau")}
                                    </p>
                                </div>
                                <div className="stitch-card p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">{t("Pelajar terdaftar")}</span>
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a34b05]">
                                            <Users className="size-5" />
                                        </span>
                                    </div>
                                    <p className="mt-5 text-3xl font-extrabold">{learnerCount}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">{t("Aktivitas tersedia di laporan pelajar")}</p>
                                </div>
                            </div>
                            <div className="grid gap-7 xl:grid-cols-[1.6fr_1fr]">
                                <section className="stitch-card overflow-hidden">
                                    <div className="flex items-center justify-between border-b px-6 py-5">
                                        <div>
                                            <h2 className="text-lg font-semibold">{t("Kelas yang dikelola")}</h2>
                                            <p className="mt-1 text-sm text-muted-foreground">{t("Pilih kelas untuk melanjutkan penyusunan materi.")}</p>
                                        </div>
                                        <Link href="/admin?section=paths" className="text-sm font-semibold text-link hover:underline">
                                            {t("Lihat semua")}
                                        </Link>
                                    </div>
                                    {paths.length ? (
                                        <div className="divide-y">
                                            {paths.map((path) => (
                                                <button
                                                    key={path.id}
                                                    type="button"
                                                    onClick={() => goToPath(path)}
                                                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-secondary"
                                                >
                                                    <span>
                                                        <span className="block font-semibold">{path.title}</span>
                                                        <span className="mt-1 block text-sm text-muted-foreground">
                                                            {path.units?.length ?? 0} {t("unit ·")} {(path.units ?? []).flatMap((unit) => unit.lessons ?? []).length} {t("pelajaran")}
                                                        </span>
                                                    </span>
                                                    <span className="flex items-center gap-3">
                                                        <Status value={path.status} />
                                                        <ChevronRight className="size-4 text-muted-foreground" />
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6">
                                            <Empty
                                                icon={LibraryBig}
                                                title="Belum ada kelas belajar"
                                                detail="Buat kelas untuk mulai mengatur unit dan pelajaran."
                                                action={<Button onClick={() => openPath()}>{t("Buat kelas")}</Button>}
                                            />
                                        </div>
                                    )}
                                </section>
                                <aside className="stitch-card p-6">
                                    <h2 className="text-lg font-semibold">{t("Alur penerbitan")}</h2>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("Materi harus lengkap dan ditinjau sebelum dibuka untuk pelajar.")}</p>
                                    <ol className="mt-6 space-y-5">
                                        {[
                                            ["01", "Susun pelajaran", "Tambahkan isi materi, contoh, dan latihan."],
                                            ["02", "Tinjau konten", "Periksa ragam bahasa, aksara, dan jawaban."],
                                            ["03", "Terbitkan berurutan", "Pelajaran, unit, lalu kelas belajar."],
                                        ].map(([number, title, description]) => (
                                            <li key={number} className="flex gap-4">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-link">{number}</span>
                                                <span>
                                                    <strong className="block text-sm">{title}</strong>
                                                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                    <Link href="/admin?section=paths" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline">
                                        {t("Kelola kelas")} <ArrowRight className="size-4" />
                                    </Link>
                                </aside>
                            </div>
                        </div>
    );
}

import { t } from "@/lib/ui-language";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, BookOpen, ClipboardCheck } from "lucide-react";

type Progress = {
    id: number;
    title: string;
    path_title: string;
    status: string;
    updated_at: string;
};
type Attempt = {
    id: number;
    title: string;
    correct_count: number;
    total_count: number;
    created_at: string;
};

export default function ProgressPage({
    progress,
    attempts,
}: {
    progress: Progress[];
    attempts: Attempt[];
}) {
    const complete = progress.filter((item) => item.status === "completed").length;
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t("Progres belajar")} />
            <p className="stitch-kicker">{t("JEJAK BELAJAR")}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{t("Progres belajar")}</h1>
            <p className="mt-3 text-muted-foreground">
                {t("Kembali ke pelajaran yang sudah dimulai dan tinjau hasil latihan Anda.")}
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
                <div className="stitch-card p-5">
                    <p className="stitch-kicker">{t("PELAJARAN SELESAI")}</p>
                    <p className="mt-3 text-3xl font-extrabold text-[#493ee5]">{complete}</p>
                </div>
                <div className="stitch-card p-5">
                    <p className="stitch-kicker">{t("SEDANG DIPELAJARI")}</p>
                    <p className="mt-3 text-3xl font-extrabold text-[#006c4a]">
                        {progress.length - complete}
                    </p>
                </div>
                <div className="stitch-card p-5">
                    <p className="stitch-kicker">{t("LATIHAN DIKERJAKAN")}</p>
                    <p className="mt-3 text-3xl font-extrabold text-[#a34b05]">{attempts.length}</p>
                </div>
            </div>
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <section className="min-w-0">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{t("Pelajaran")}</h2>
                        {progress.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                                {complete} {t("dari")} {progress.length} {t("selesai")}
                            </span>
                        )}
                    </div>
                    {progress.length ? (
                        <div className="stitch-card divide-y overflow-hidden">
                            {progress.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/pelajaran/${item.id}`}
                                    className="group flex min-h-20 items-center gap-4 px-5 py-4 hover:bg-secondary"
                                >
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-link">
                                        <BookOpen className="size-[18px]" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-xs text-muted-foreground">
                                            {item.path_title}
                                        </span>
                                        <strong className="mt-1 block truncate group-hover:text-link">
                                            {item.title}
                                        </strong>
                                        <span className="mt-1 block text-xs text-muted-foreground">
                                            {t(item.status === "completed"
                                                ? "Selesai"
                                                : "Sedang dipelajari")}
                                        </span>
                                    </span>
                                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="stitch-card p-7">
                            <BookOpen className="size-6 text-muted-foreground" />
                            <h3 className="mt-4 font-semibold">{t("Belum memulai pelajaran")}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {t("Pilih satu kelas belajar untuk membuka pelajaran pertama Anda.")}
                            </p>
                            <Link href="/dashboard#kelas-belajar" className="btn-secondary mt-5">
                                {t("Pilih kelas belajar")}
                            </Link>
                        </div>
                    )}
                </section>
                <section className="min-w-0">
                    <h2 className="mb-4 text-xl font-semibold">{t("Riwayat latihan")}</h2>
                    {attempts.length ? (
                        <div className="stitch-card divide-y overflow-hidden">
                            {attempts.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/hasil/${item.id}`}
                                    className="group flex min-h-20 items-center gap-4 px-5 py-4 hover:bg-secondary"
                                >
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                                        <ClipboardCheck className="size-[18px]" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <strong className="block truncate group-hover:text-link">
                                            {item.title}
                                        </strong>
                                        <span className="mt-1 block text-sm text-muted-foreground">
                                            {item.correct_count} {t("dari")} {item.total_count} {t("jawaban benar")}
                                        </span>
                                    </span>
                                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="stitch-card p-7">
                            <ClipboardCheck className="size-6 text-muted-foreground" />
                            <h3 className="mt-4 font-semibold">{t("Belum ada hasil latihan")}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {t("Latihan akan muncul di sini setelah Anda mengerjakannya dari halaman pelajaran.")}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

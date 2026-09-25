import { Link } from "@inertiajs/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { t } from "@/lib/ui-language";

export type PaginationMeta = {
    previous: string | null;
    next: string | null;
    from: number;
    to: number;
    total: number;
};

export default function PaginationControls({
    pagination,
    preserveScroll = false,
}: {
    pagination: PaginationMeta;
    preserveScroll?: boolean;
}) {
    if (!pagination.previous && !pagination.next) return null;

    return (
        <nav aria-label={t("Navigasi halaman")} className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <span className="text-xs text-muted-foreground">
                {t("Menampilkan")} {pagination.from}–{pagination.to} {t("dari")} {pagination.total}
            </span>
            <div className="flex gap-2">
                {pagination.previous ? (
                    <Link href={pagination.previous} preserveScroll={preserveScroll} className="btn-secondary min-h-9 px-3 text-xs">
                        <ArrowLeft className="size-3.5" /> {t("Sebelumnya")}
                    </Link>
                ) : (
                    <span className="btn-secondary min-h-9 px-3 text-xs opacity-40"><ArrowLeft className="size-3.5" /> {t("Sebelumnya")}</span>
                )}
                {pagination.next ? (
                    <Link href={pagination.next} preserveScroll={preserveScroll} className="btn-secondary min-h-9 px-3 text-xs">
                        {t("Berikutnya")} <ArrowRight className="size-3.5" />
                    </Link>
                ) : (
                    <span className="btn-secondary min-h-9 px-3 text-xs opacity-40">{t("Berikutnya")} <ArrowRight className="size-3.5" /></span>
                )}
            </div>
        </nav>
    );
}

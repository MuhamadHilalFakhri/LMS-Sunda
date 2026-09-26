import { t } from '@/lib/ui-language';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CollectionPagination({
    total,
    page,
    pageSize,
    onPageChange,
}: {
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}) {
    if (total === 0) return null;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const first = (page - 1) * pageSize + 1;
    const last = Math.min(page * pageSize, total);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
                {t('Menampilkan')} {first}–{last} {t('dari')} {total}
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    disabled={page <= 1}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                >
                    <ChevronRight className="size-4 rotate-180" />{' '}
                    {t('Sebelumnya')}
                </Button>
                <span className="min-w-14 text-center text-xs font-medium text-muted-foreground">
                    {page} / {pageCount}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    disabled={page >= pageCount}
                    onClick={() => onPageChange(Math.min(pageCount, page + 1))}
                >
                    {t('Berikutnya')} <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}

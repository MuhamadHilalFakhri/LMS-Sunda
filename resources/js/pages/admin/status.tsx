import { t } from '@/lib/ui-language';
import { labelStatus } from '@/pages/admin/form-fields';

export function Status({ value }: { value: string }) {
    return (
        <span
            className={`inline-flex items-center rounded border px-2 py-1 text-xs font-semibold ${value === 'published' ? 'border-[#b3dcc3] bg-[#eff8f2] text-[#17633a] dark:border-[#3c7354] dark:bg-[#1e382b] dark:text-[#b2e7c4]' : value === 'review' ? 'border-[#e6d9ac] bg-[#faf6e9] text-[#77581a] dark:border-[#766740] dark:bg-[#393326] dark:text-[#f0d58d]' : 'border-border bg-secondary text-muted-foreground'}`}
        >
            {t(labelStatus(value))}
        </span>
    );
}

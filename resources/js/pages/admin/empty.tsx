import { t } from '@/lib/ui-language';
import { Pencil } from '@/components/meya-icons';

export function Empty({
    icon: Icon,
    title,
    detail,
    action,
}: {
    icon: typeof Pencil;
    title: string;
    detail: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-9 text-center">
            <Icon className="size-7 text-muted-foreground" strokeWidth={1.6} />
            <h3 className="mt-4 font-semibold">{t(title)}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {t(detail)}
            </p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

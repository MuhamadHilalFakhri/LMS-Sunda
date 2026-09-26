import { t } from '@/lib/ui-language';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function IconAction({
    label,
    icon: Icon,
    action,
    danger = false,
}: {
    label: string;
    icon: typeof Pencil;
    action: () => void;
    danger?: boolean;
}) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className={`size-10 ${danger ? 'text-[#b42335]' : 'text-muted-foreground'}`}
            aria-label={t(label)}
            title={t(label)}
            onClick={action}
        >
            <Icon className="size-4" />
        </Button>
    );
}

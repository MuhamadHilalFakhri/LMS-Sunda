import { t } from '@/lib/ui-language';
import {
    Activity,
    Bot,
    MessageSquareWarning,
} from 'lucide-react';
import type { TutorSettings } from '@/pages/admin/types';

export function TutorStatusCards({ settings }: { settings: TutorSettings }) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <div className="stitch-card flex items-center gap-3 p-4">
                <span
                    className={`flex size-10 items-center justify-center rounded-xl ${settings.enabled ? 'bg-[#eaf8ef] text-[#17633a]' : 'bg-secondary text-muted-foreground'}`}
                >
                    <Bot className="size-5" />
                </span>
                <div>
                    <p className="text-xs text-muted-foreground">
                        {t('Status tutor')}
                    </p>
                    <p className="text-sm font-bold">
                        {settings.enabled ? t('Aktif') : t('Dinonaktifkan')}
                    </p>
                </div>
            </div>
            <div className="stitch-card flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                    <MessageSquareWarning className="size-5" />
                </span>
                <div>
                    <p className="text-xs text-muted-foreground">
                        {t('Pesan hari ini')}
                    </p>
                    <p className="text-sm font-bold">
                        {settings.messagesToday}
                    </p>
                </div>
            </div>
            <div className="stitch-card flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff4e5] text-[#a34b05]">
                    <Activity className="size-5" />
                </span>
                <div>
                    <p className="text-xs text-muted-foreground">
                        {t('Token hari ini')}
                    </p>
                    <p className="text-sm font-bold">
                        {settings.tokensToday.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>
        </div>
    );
}



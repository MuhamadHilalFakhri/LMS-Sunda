import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import { Check, Circle } from '@/components/meya-icons';
import { moduleUrl, Lesson } from '@/types/learning';

export type ModuleLesson = Pick<
    Lesson,
    'id' | 'title' | 'summary' | 'position'
>;

export type ModuleUnit = Pick<
    NonNullable<Lesson['unit']>,
    'id' | 'title' | 'description'
>;

export type ModulePath = { id: number; slug: string; title: string };

export type WorkspaceLesson = Omit<Lesson, 'unit'> & {
    unit: { id: number; title: string; path: ModulePath };
};

export function youtubeEmbedUrl(value: string | null | undefined) {
    if (!value) return null;
    try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase().replace(/^www\./, '');
        let id = '';
        if (host === 'youtu.be')
            id = url.pathname.split('/').filter(Boolean)[0] ?? '';
        else if (host === 'youtube.com' || host === 'm.youtube.com') {
            id =
                url.searchParams.get('v') ??
                url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ??
                '';
        }
        return /^[\w-]{11}$/.test(id)
            ? 'https://www.youtube-nocookie.com/embed/' + id
            : null;
    } catch {
        return null;
    }
}

export function ModuleMaterialList({
    unit,
    lessons,
    currentLessonId,
    progress,
    onNavigate,
}: {
    unit: ModuleUnit;
    lessons: ModuleLesson[];
    currentLessonId: number | null;
    progress: Record<number, string>;
    onNavigate?: () => void;
}) {
    if (!lessons.length) {
        return (
            <p className="rounded-xl bg-secondary/60 p-4 text-sm leading-6 text-muted-foreground">
                {t('Belum ada materi terbit dalam modul ini.')}
            </p>
        );
    }

    return (
        <nav
            aria-label={t('Materi dalam modul') + ' ' + unit.title}
            className="space-y-1"
        >
            {lessons.map((item, index) => {
                const active = item.id === currentLessonId;
                const completed = progress[item.id] === 'completed';
                return (
                    <Link
                        key={item.id}
                        href={moduleUrl(unit.id, item.id)}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={`flex min-h-[58px] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${active ? 'bg-[#efedff] text-[#3428cf] ring-1 ring-[#d9d4ff] ring-inset' : 'text-foreground hover:bg-secondary'}`}
                    >
                        <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${completed ? 'bg-[#e7f7ee] text-[#147548]' : active ? 'bg-white text-[#493ee5]' : 'bg-secondary text-muted-foreground'}`}
                        >
                            {completed ? (
                                <Check className="size-4" />
                            ) : (
                                index + 1
                            )}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span
                                className={`line-clamp-2 block text-sm leading-5 ${active ? 'font-bold' : 'font-medium'}`}
                            >
                                {item.title}
                            </span>
                            {active && (
                                <span className="mt-0.5 block text-[10px] font-bold tracking-wide text-[#493ee5] uppercase">
                                    {t('Sedang dipelajari')}
                                </span>
                            )}
                            {!active && completed && (
                                <span className="mt-0.5 block text-[10px] font-medium text-[#147548]">
                                    {t('Selesai')}
                                </span>
                            )}
                        </span>
                        {!completed && progress[item.id] === 'in_progress' && (
                            <Circle
                                className="size-2.5 shrink-0 fill-[#493ee5] text-[#493ee5]"
                                aria-label={t('Berjalan')}
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}

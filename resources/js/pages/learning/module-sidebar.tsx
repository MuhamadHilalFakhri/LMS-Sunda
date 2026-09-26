import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Menu } from 'lucide-react';
import {
    ModuleMaterialList,
    type ModuleLesson,
    type ModuleUnit,
} from '@/pages/learning/module-navigation';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

type Props = {
    unit: ModuleUnit;
    lessons: ModuleLesson[];
    currentLessonId: number | null;
    progress: Record<number, string>;
    classUrl: string;
    completedLessons: number;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    currentLessonTitle?: string;
};

export function ModuleSidebar({
    unit,
    lessons,
    currentLessonId,
    progress,
    classUrl,
    completedLessons,
    mobileOpen,
    setMobileOpen,
    currentLessonTitle,
}: Props) {
    const percentage = Math.round(
        lessons.length ? (completedLessons / lessons.length) * 100 : 0,
    );
    return (
        <>
            <aside className="hidden min-h-0 flex-col border-r bg-card lg:flex">
                <div className="shrink-0 border-b p-5">
                    <p className="stitch-kicker">{t('MODUL AKTIF')}</p>
                    <h2 className="mt-1 line-clamp-2 text-base font-extrabold">
                        {unit.title}
                    </h2>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                            {completedLessons} {t('dari')} {lessons.length}{' '}
                            {t('materi selesai')}
                        </span>
                        <span className="font-bold text-foreground">
                            {percentage}%
                        </span>
                    </div>
                    <div
                        className="stitch-progress mt-2"
                        role="progressbar"
                        aria-label={`${t('Progres modul')} ${unit.title}`}
                        aria-valuenow={completedLessons}
                        aria-valuemin={0}
                        aria-valuemax={lessons.length || 1}
                    >
                        <span style={{ width: `${percentage}%` }} />
                    </div>
                    <Link
                        href={classUrl}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-link hover:underline"
                    >
                        <ArrowLeft className="size-3.5" />{' '}
                        {t('Kembali ke daftar modul')}
                    </Link>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                    <p className="mb-2 px-2 text-[10px] font-extrabold tracking-wide text-muted-foreground uppercase">
                        {t('MATERI DALAM MODUL')}
                    </p>
                    <ModuleMaterialList
                        unit={unit}
                        lessons={lessons}
                        currentLessonId={currentLessonId}
                        progress={progress}
                    />
                </div>
            </aside>

            <div className="flex items-center gap-3 lg:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            className="btn-secondary h-11 shrink-0 gap-2 px-3"
                            aria-label={t('Buka daftar materi')}
                        >
                            <Menu className="size-4" />
                            <span>
                                {t('Materi')} ({lessons.length})
                            </span>
                        </button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-[min(88vw,360px)] gap-0 p-0 sm:max-w-[360px]"
                    >
                        <SheetHeader className="border-b pr-12 text-left">
                            <SheetTitle>{unit.title}</SheetTitle>
                            <SheetDescription>
                                {completedLessons} {t('dari')} {lessons.length}{' '}
                                {t('materi selesai')}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="min-h-0 flex-1 overflow-y-auto p-3">
                            <ModuleMaterialList
                                unit={unit}
                                lessons={lessons}
                                currentLessonId={currentLessonId}
                                progress={progress}
                                onNavigate={() => setMobileOpen(false)}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="min-w-0">
                    <p className="truncate text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                        {unit.title}
                    </p>
                    <p className="truncate text-xs font-semibold">
                        {currentLessonTitle ?? t('Belum ada materi terbit')}
                    </p>
                </div>
            </div>
        </>
    );
}

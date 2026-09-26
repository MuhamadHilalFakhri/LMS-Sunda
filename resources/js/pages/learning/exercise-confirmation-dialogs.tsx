import { t } from '@/lib/ui-language';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    finishOpen: boolean;
    leaveOpen: boolean;
    isQuiz: boolean;
    processing: boolean;
    unansweredCount: number;
    onFinishOpenChange: (open: boolean) => void;
    onLeaveOpenChange: (open: boolean) => void;
    onReviewUnanswered: () => void;
    onSubmit: () => void;
    onConfirmLeave: () => void;
};

export function ExerciseConfirmationDialogs({
    finishOpen,
    leaveOpen,
    isQuiz,
    processing,
    unansweredCount,
    onFinishOpenChange,
    onLeaveOpenChange,
    onReviewUnanswered,
    onSubmit,
    onConfirmLeave,
}: Props) {
    return (
        <>
            <Dialog open={finishOpen} onOpenChange={onFinishOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {unansweredCount > 0
                                ? t('Masih ada soal belum dijawab')
                                : t('Kumpulkan kuis?')}
                        </DialogTitle>
                        <DialogDescription>
                            {unansweredCount > 0
                                ? `${t('Masih ada')} ${unansweredCount} ${t('soal yang belum dijawab. Anda bisa memeriksanya dulu atau tetap mengumpulkan kuis.')}`
                                : t(
                                      'Pastikan semua jawaban sudah benar. Setelah dikumpulkan, jawaban tidak dapat diubah.',
                                  )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        {unansweredCount > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onReviewUnanswered}
                            >
                                {t('Periksa jawaban')}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onFinishOpenChange(false)}
                        >
                            {t('Kembali ke kuis')}
                        </Button>
                        <Button
                            type="button"
                            disabled={processing}
                            className={
                                isQuiz
                                    ? 'bg-[#a34b05] text-white hover:bg-[#843b03]'
                                    : undefined
                            }
                            onClick={onSubmit}
                        >
                            {t(
                                unansweredCount > 0
                                    ? 'Kumpulkan tetap'
                                    : 'Kumpulkan kuis',
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={leaveOpen} onOpenChange={onLeaveOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Keluar dari kuis?')}</DialogTitle>
                        <DialogDescription>
                            {t(
                                'Jawaban kuis ini belum dikumpulkan. Jika Anda pindah halaman sekarang, jawaban yang sudah dipilih akan hilang.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onLeaveOpenChange(false)}
                        >
                            {t('Tetap di kuis')}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirmLeave}
                        >
                            {t('Keluar dari kuis')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

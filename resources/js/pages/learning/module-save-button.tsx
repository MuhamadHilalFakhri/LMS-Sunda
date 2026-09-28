import { router } from '@inertiajs/react';
import { Bookmark, BookmarkCheck } from '@/components/meya-icons';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/ui-language';

export function ModuleSaveButton({
    unitId,
    saved,
    onUnsave,
}: {
    unitId: number;
    saved: boolean;
    onUnsave?: () => void;
}) {
    const [processing, setProcessing] = useState(false);
    const label = saved ? 'Hapus modul dari materi tersimpan' : 'Simpan modul';

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={processing}
            aria-label={t(label)}
            aria-pressed={saved}
            title={t(label)}
            className="size-9 shrink-0 text-muted-foreground hover:bg-[#efedff] hover:text-[#493ee5]"
            onClick={() => {
                setProcessing(true);
                const options = {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            t(
                                saved
                                    ? 'Modul dihapus dari materi tersimpan.'
                                    : 'Modul disimpan untuk dipelajari nanti.',
                            ),
                        );
                        if (saved) onUnsave?.();
                    },
                    onError: () =>
                        toast.error(t('Modul gagal diperbarui. Coba lagi.')),
                    onFinish: () => setProcessing(false),
                };

                if (saved) {
                    router.delete(`/modul-tersimpan/${unitId}`, options);
                } else {
                    router.post(`/modul-tersimpan/${unitId}`, {}, options);
                }
            }}
        >
            {saved ? (
                <BookmarkCheck className="size-4 text-[#493ee5]" />
            ) : (
                <Bookmark className="size-4" />
            )}
        </Button>
    );
}

import { t } from '@/lib/ui-language';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { DeleteConfig } from '@/pages/admin/types';

export function DeleteModal({
    config,
    close,
}: {
    config: DeleteConfig | null;
    close: () => void;
}) {
    const [processing, setProcessing] = useState(false);
    if (!config) return null;
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !processing) close();
            }}
        >
            <DialogContent className="bg-card sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {t('Hapus')} {config.label}?
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            config.description ??
                                'Konten ini beserta semua bagian di dalamnya akan dihapus secara permanen.',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        className="min-h-11"
                        onClick={close}
                    >
                        {t('Batal')}
                    </Button>
                    <Button
                        variant="destructive"
                        className="min-h-11"
                        disabled={processing}
                        onClick={() => {
                            setProcessing(true);
                            router.delete(
                                `/admin/${config.type}/${config.id}`,
                                {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        close();
                                        toast.success(
                                            t(
                                                config.successMessage ??
                                                    'Konten berhasil dihapus.',
                                            ),
                                        );
                                    },
                                    onError: (errors) => {
                                        const message =
                                            Object.values(errors)[0];
                                        if (message) toast.error(t(message));
                                    },
                                    onFinish: () => setProcessing(false),
                                },
                            );
                        }}
                    >
                        {t(processing ? 'Menghapus...' : 'Ya, hapus')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

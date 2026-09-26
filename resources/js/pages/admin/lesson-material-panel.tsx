import { t } from '@/lib/ui-language';
import { FileText, Pencil, Plus, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Block, Lesson } from '@/types/learning';
import { blockTypes } from '@/pages/admin/form-fields';
import type { DeleteConfig } from '@/pages/admin/types';
import { Empty, IconAction } from '@/pages/admin/common-ui';

type Props = {
    lesson: Lesson;
    openBlock: (block?: Block, lesson?: Lesson) => void;
    remove: (value: DeleteConfig) => void;
};

export function LessonMaterialPanel({ lesson, openBlock, remove }: Props) {
    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {t('Susun teks dan contoh sesuai urutan belajar.')}
                </p>
                <Button
                    variant="outline"
                    className="min-h-10"
                    onClick={() => openBlock(undefined, lesson)}
                >
                    <Plus className="size-4" /> {t('Blok materi')}
                </Button>
            </div>
            {lesson.blocks?.length ? (
                <div className="space-y-3">
                    {lesson.blocks.map((block) => (
                        <article
                            key={block.id}
                            className="rounded-md border p-4"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {blockTypes.find(
                                            (item) => item.value === block.type,
                                        )?.label ?? 'Materi'}
                                    </span>
                                    <h4 className="mt-1 font-semibold">
                                        {block.title ||
                                            block.latin ||
                                            'Blok materi'}
                                    </h4>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <IconAction
                                        label="Ubah blok"
                                        icon={Pencil}
                                        action={() => openBlock(block, lesson)}
                                    />
                                    <IconAction
                                        label="Hapus blok"
                                        icon={Trash2}
                                        danger
                                        action={() =>
                                            remove({
                                                type: 'blocks',
                                                id: block.id,
                                                label:
                                                    block.title ||
                                                    'blok materi',
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            {block.body && (
                                <p className="mt-3 line-clamp-3 text-sm leading-6 whitespace-pre-line text-muted-foreground">
                                    {block.body}
                                </p>
                            )}
                            {block.sundanese && (
                                <p
                                    lang="su"
                                    className="sunda-script mt-2 text-xl"
                                >
                                    {block.sundanese}
                                </p>
                            )}
                            {block.translation && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {block.translation}
                                </p>
                            )}
                            {block.context && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {t('Konteks:')} {block.context}
                                </p>
                            )}
                            {block.audio_path && (
                                <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <Volume2 className="size-3.5" />{' '}
                                    {t('Audio tersedia')}
                                </span>
                            )}
                        </article>
                    ))}
                </div>
            ) : (
                <Empty
                    icon={FileText}
                    title="Materi belum diisi"
                    detail="Pelajaran memerlukan paling sedikit satu blok materi sebelum bisa diterbitkan."
                    action={
                        <Button
                            variant="outline"
                            onClick={() => openBlock(undefined, lesson)}
                        >
                            {t('Tambah materi')}
                        </Button>
                    }
                />
            )}
        </>
    );
}

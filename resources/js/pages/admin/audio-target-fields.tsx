import { t } from '@/lib/ui-language';
import { Plus } from '@/components/meya-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AudioBlock, AudioLesson } from '@/pages/admin/types';

type Props = {
    blocks: AudioBlock[];
    lessons: AudioLesson[];
    targetMode: 'existing' | 'new';
    setTargetMode: (mode: 'existing' | 'new') => void;
    blockId: string;
    setBlockId: (id: string) => void;
    lessonId: string;
    setLessonId: (id: string) => void;
    newPhrase: string;
    setNewPhrase: (phrase: string) => void;
    newMeaning: string;
    setNewMeaning: (meaning: string) => void;
    selectedBlock?: AudioBlock;
    disabled: boolean;
};

export function AudioTargetFields(props: Props) {
    const {
        blocks,
        lessons,
        targetMode,
        setTargetMode,
        blockId,
        setBlockId,
        lessonId,
        setLessonId,
        newPhrase,
        setNewPhrase,
        newMeaning,
        setNewMeaning,
        selectedBlock,
        disabled,
    } = props;
    return (
        <>
            <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                <Button
                    type="button"
                    variant={targetMode === 'existing' ? 'default' : 'outline'}
                    className="min-h-10 min-w-0 justify-start text-left whitespace-normal"
                    disabled={disabled}
                    onClick={() => setTargetMode('existing')}
                >
                    {t('Gunakan materi yang sudah ada')}
                </Button>
                <Button
                    type="button"
                    variant={targetMode === 'new' ? 'default' : 'outline'}
                    className="min-h-10 min-w-0 justify-start text-left whitespace-normal"
                    disabled={disabled}
                    onClick={() => setTargetMode('new')}
                >
                    <Plus className="size-4" /> {t('Buat materi baru')}
                </Button>
            </div>

            {targetMode === 'existing' ? (
                <div className="min-w-0 space-y-2">
                    <label htmlFor="audio-block" className="field-label">
                        {t('Materi tujuan')}
                    </label>
                    <Select
                        value={blockId}
                        disabled={disabled}
                        onValueChange={setBlockId}
                    >
                        <SelectTrigger
                            id="audio-block"
                            className="h-11 w-full max-w-full min-w-0 overflow-hidden bg-card"
                        >
                            <SelectValue
                                className="min-w-0 flex-1 truncate text-left"
                                placeholder={t(
                                    'Pilih materi yang akan diberi audio',
                                )}
                            />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                            {blocks.map((block) => (
                                <SelectItem
                                    key={block.id}
                                    value={String(block.id)}
                                >
                                    {(block.latin ||
                                        block.title ||
                                        t('Blok materi')) +
                                        ` · ${block.lessonTitle} / ${block.pathTitle}`}
                                    {block.audio_path
                                        ? ` · ${t('audio akan diganti')}`
                                        : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedBlock && (
                        <p className="text-xs text-muted-foreground">
                            {selectedBlock.audio_path
                                ? t(
                                      'Audio lama akan diganti setelah audio baru berhasil disimpan.',
                                  )
                                : t('Audio akan ditambahkan pada materi ini.')}
                        </p>
                    )}
                </div>
            ) : (
                <div className="min-w-0 space-y-4 overflow-hidden rounded-xl border p-4">
                    <div className="space-y-2">
                        <label htmlFor="audio-lesson" className="field-label">
                            {t('Pelajaran tujuan')}
                        </label>
                        <Select
                            value={lessonId}
                            disabled={disabled}
                            onValueChange={setLessonId}
                        >
                            <SelectTrigger
                                id="audio-lesson"
                                className="h-11 w-full max-w-full min-w-0 overflow-hidden bg-card"
                            >
                                <SelectValue
                                    className="min-w-0 flex-1 truncate text-left"
                                    placeholder={t('Pilih pelajaran')}
                                />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                                {lessons.map((lesson) => (
                                    <SelectItem
                                        key={lesson.id}
                                        value={String(lesson.id)}
                                    >{`${lesson.pathTitle} / ${lesson.unitTitle} / ${lesson.title}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="audio-new-phrase"
                            className="field-label"
                        >
                            {t('Tulisan Latin / frasa')}
                        </label>
                        <Input
                            id="audio-new-phrase"
                            value={newPhrase}
                            maxLength={160}
                            disabled={disabled}
                            placeholder={t('Contoh: Wilujeng enjing')}
                            onChange={(event) =>
                                setNewPhrase(event.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="audio-new-meaning"
                            className="field-label"
                        >
                            {t('Arti Bahasa Indonesia (opsional)')}
                        </label>
                        <textarea
                            id="audio-new-meaning"
                            className="field min-h-20 resize-y"
                            value={newMeaning}
                            maxLength={2000}
                            disabled={disabled}
                            placeholder={t('Tulis arti atau konteks materi.')}
                            onChange={(event) =>
                                setNewMeaning(event.target.value)
                            }
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t(
                            'Materi baru akan disimpan sebagai entri kosakata pada pelajaran pilihan.',
                        )}
                    </p>
                </div>
            )}
        </>
    );
}

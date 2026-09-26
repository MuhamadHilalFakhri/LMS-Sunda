import { t } from '@/lib/ui-language';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
import { questionFieldsForType, textValue } from '@/pages/admin/form-fields';
import { FormFieldControl } from '@/pages/admin/form-field-control';
import type { FormConfig, FormValue } from '@/pages/admin/types';

export function FormModal({
    config,
    close,
}: {
    config: FormConfig | null;
    close: () => void;
}) {
    const [values, setValues] = useState<Record<string, FormValue>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [choiceOptions, setChoiceOptions] = useState<string[]>([
        '',
        '',
        '',
        '',
    ]);
    const [choiceAnswerIndex, setChoiceAnswerIndex] = useState(0);
    useEffect(() => {
        setValues(config?.values ?? {});
        setErrors({});
        const existingOptions = textValue(config?.values?.options)
            .split('\n')
            .map((option) => option.trim());
        const options = existingOptions.some(Boolean)
            ? existingOptions
            : ['', '', '', ''];
        setChoiceOptions(options);
        const answer = textValue(config?.values?.answer);
        const answerIndex = options.findIndex(
            (option) => option === answer && option !== '',
        );
        setChoiceAnswerIndex(answerIndex >= 0 ? answerIndex : 0);
    }, [config]);
    if (!config) return null;
    const questionType = textValue(values.type) || 'multiple_choice';
    const isRadioQuestion = Boolean(
        config.questionForm &&
        ['multiple_choice', 'listening'].includes(questionType),
    );
    const fields = config.questionForm
        ? questionFieldsForType(textValue(values.type) || 'multiple_choice')
        : config.fields;
    const visibleFields = isRadioQuestion
        ? fields.filter((field) => field.name !== 'answer')
        : fields;
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        const data = { ...values, ...config.hidden };
        delete data.audio_path;
        if (isRadioQuestion) {
            data.options = choiceOptions
                .map((option) => option.trim())
                .filter(Boolean);
            data.answer = choiceOptions[choiceAnswerIndex]?.trim() ?? '';
        } else if (fields.some((field) => field.name === 'options'))
            data.options = textValue(values.options)
                .split('\n')
                .map((option) => option.trim())
                .filter(Boolean);
        else if (config.questionForm) delete data.options;
        const callbacks = {
            preserveScroll: true,
            onError: (messages: Record<string, string>) => setErrors(messages),
            onSuccess: () => {
                close();
                if (!config.silentSuccess) {
                    toast.success(
                        t(
                            config.successMessage ??
                                'Perubahan berhasil disimpan.',
                        ),
                    );
                }
            },
            onFinish: () => setProcessing(false),
        };
        if (fields.some((field) => field.type === 'file')) {
            const form = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value instanceof File) form.append(key, value);
                else if (Array.isArray(value))
                    value.forEach((item, index) =>
                        form.append(`${key}[${index}]`, `${item}`),
                    );
                else if (value != null) form.append(key, `${value}`);
            });
            if (config.method === 'put') form.append('_method', 'PUT');
            router.post(config.url, form, {
                ...callbacks,
                forceFormData: true,
            });
        } else router[config.method ?? 'post'](config.url, data, callbacks);
    };
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !processing) close();
            }}
        >
            <DialogContent className="max-h-[min(90vh,780px)] overflow-y-auto border-border bg-card sm:max-w-[620px]">
                <DialogHeader className="pr-7 text-left">
                    <DialogTitle className="text-xl">
                        {t(config.title)}
                    </DialogTitle>
                    <DialogDescription>
                        {t(config.description)}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5 pt-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {visibleFields.map((field) => (
                            <FormFieldControl
                                key={field.name}
                                field={field}
                                config={config}
                                values={values}
                                setValues={setValues}
                                errors={errors}
                                isRadioQuestion={isRadioQuestion}
                                choiceOptions={choiceOptions}
                                setChoiceOptions={setChoiceOptions}
                                choiceAnswerIndex={choiceAnswerIndex}
                                setChoiceAnswerIndex={setChoiceAnswerIndex}
                            />
                        ))}
                    </div>
                    <DialogFooter className="border-t pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            onClick={close}
                        >
                            {t('Batal')}
                        </Button>
                        <Button
                            type="submit"
                            className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={processing}
                        >
                            {processing
                                ? t('Menyimpan...')
                                : t(config.submitLabel ?? 'Simpan perubahan')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

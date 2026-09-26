import { t } from '@/lib/ui-language';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Dispatch, SetStateAction } from 'react';
import type { Field, FormConfig, FormValue } from '@/pages/admin/types';
import { textValue } from '@/pages/admin/form-fields';
import { RadioChoiceOptions } from '@/pages/admin/radio-choice-options';

type Props = {
    field: Field;
    config: FormConfig;
    values: Record<string, FormValue>;
    setValues: Dispatch<SetStateAction<Record<string, FormValue>>>;
    errors: Record<string, string>;
    isRadioQuestion: boolean;
    choiceOptions: string[];
    setChoiceOptions: Dispatch<SetStateAction<string[]>>;
    choiceAnswerIndex: number;
    setChoiceAnswerIndex: Dispatch<SetStateAction<number>>;
};

export function FormFieldControl({
    field,
    config,
    values,
    setValues,
    errors,
    isRadioQuestion,
    choiceOptions,
    setChoiceOptions,
    choiceAnswerIndex,
    setChoiceAnswerIndex,
}: Props) {
    return (
        <div
            key={field.name}
            className={
                field.type === 'textarea' ||
                field.type === 'file' ||
                (isRadioQuestion && field.name === 'options')
                    ? 'sm:col-span-2'
                    : ''
            }
        >
            {isRadioQuestion && field.name === 'options' ? (
                <RadioChoiceOptions
                    field={field}
                    errors={errors}
                    choiceOptions={choiceOptions}
                    setChoiceOptions={setChoiceOptions}
                    choiceAnswerIndex={choiceAnswerIndex}
                    setChoiceAnswerIndex={setChoiceAnswerIndex}
                />
            ) : (
                <>
                    <label
                        htmlFor={`edit-${field.name}`}
                        className="field-label"
                    >
                        {t(field.label)}
                    </label>
                    {field.type === 'select' ? (
                        <Select
                            value={textValue(
                                values[field.name] ?? field.options?.[0]?.value,
                            )}
                            onValueChange={(value) => {
                                const typeChanged =
                                    config.questionForm &&
                                    field.name === 'type' &&
                                    textValue(values.type) !== value;
                                if (typeChanged) {
                                    setChoiceOptions(['', '', '', '']);
                                    setChoiceAnswerIndex(0);
                                }
                                setValues((current) => ({
                                    ...current,
                                    [field.name]: value,
                                    ...(typeChanged
                                        ? {
                                              options: '',
                                              answer: '',
                                              audio: null,
                                          }
                                        : {}),
                                }));
                            }}
                        >
                            <SelectTrigger
                                id={`edit-${field.name}`}
                                className="h-11 w-full bg-card"
                            >
                                <SelectValue placeholder={t('Pilih opsi')} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {t(option.label)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : field.type === 'textarea' ? (
                        <textarea
                            id={`edit-${field.name}`}
                            className="field min-h-24 resize-y"
                            value={textValue(values[field.name])}
                            placeholder={field.placeholder}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    [field.name]: event.target.value,
                                }))
                            }
                            required={field.required}
                        />
                    ) : (
                        <Input
                            id={`edit-${field.name}`}
                            className={`h-11 bg-card ${config.questionForm && textValue(values.type) === 'script' && field.name === 'answer' ? 'sunda-script text-xl' : ''}`}
                            type={
                                field.type === 'file'
                                    ? 'file'
                                    : field.type === 'email'
                                      ? 'email'
                                      : field.type === 'password'
                                        ? 'password'
                                        : field.type === 'number'
                                          ? 'number'
                                          : field.type === 'url'
                                            ? 'url'
                                            : 'text'
                            }
                            accept={
                                field.type === 'file'
                                    ? '.mp3,.wav,.ogg,.m4a,.webm'
                                    : undefined
                            }
                            min={field.type === 'number' ? 0 : undefined}
                            placeholder={field.placeholder}
                            lang={
                                config.questionForm &&
                                textValue(values.type) === 'script' &&
                                field.name === 'answer'
                                    ? 'su'
                                    : undefined
                            }
                            inputMode={
                                config.questionForm &&
                                textValue(values.type) === 'script' &&
                                field.name === 'answer'
                                    ? 'text'
                                    : undefined
                            }
                            required={
                                field.required &&
                                !(
                                    field.type === 'file' &&
                                    textValue(values.audio_path)
                                )
                            }
                            value={
                                field.type === 'file'
                                    ? undefined
                                    : textValue(values[field.name])
                            }
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    [field.name]:
                                        field.type === 'file'
                                            ? (event.target.files?.[0] ?? null)
                                            : event.target.value,
                                }))
                            }
                        />
                    )}
                    {field.hint && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t(field.hint)}
                        </p>
                    )}
                    {field.type === 'file' && textValue(values.audio_path) && (
                        <audio
                            controls
                            preload="none"
                            src={`/storage/${textValue(values.audio_path)}`}
                            className="mt-2 h-10 w-full max-w-sm"
                        >
                            {t('Peramban Anda tidak mendukung pemutar audio.')}
                        </audio>
                    )}
                    {errors[field.name] && (
                        <p role="alert" className="mt-1 text-sm text-[#b42335]">
                            {errors[field.name]}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

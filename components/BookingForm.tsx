'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { whatsappLink } from '@/lib/config';

const SERVICES = ['mechanic', 'bodywork', 'tires', 'oil', 'inspection', 'diagnostic'] as const;
const SYMPTOMS = ['noise', 'warning', 'vibration', 'start', 'overheat', 'brakes'] as const;
const TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand';

export default function BookingForm() {
  const t = useTranslations('Booking');
  const ts = useTranslations('Services');
  const locale = useLocale();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    brand: '',
    model: '',
    plate: '',
    service: '',
  });
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [dates, setDates] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

    const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, symptoms, description, date, time, locale }),
      });
      if (!res.ok) throw new Error('save failed');
      setSaved(true);
    } catch {
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  };
  // Les 7 prochains jours (calculés après le chargement pour éviter les erreurs d'hydratation)
  useEffect(() => {
    const list: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push(
        d.toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      );
    }
    setDates(list);
  }, [locale]);

  const update = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleSymptom = (key: string) =>
    setSymptoms((s) => (s.includes(key) ? s.filter((x) => x !== key) : [...s, key]));

  const step1Valid =
    form.name.trim() && form.phone.trim() && form.brand.trim() && form.model.trim() && form.service;

  const symptomLabels = symptoms.map((s) => t(`symptoms.${s}.label`)).join(', ');

  const message = [
    t('intro'),
    `${t('name')}: ${form.name}`,
    `${t('phone')}: ${form.phone}`,
    `${t('brand')}: ${form.brand} ${form.model}`,
    form.plate ? `${t('plate')}: ${form.plate}` : '',
    `${t('service')}: ${form.service ? ts(`${form.service}.name`) : ''}`,
    symptomLabels ? `${t('symptomsLabel')}: ${symptomLabels}` : '',
    description ? `${t('problemLabel')}: ${description}` : '',
    `${t('dateLabel')}: ${date}`,
    `${t('timeLabel')}: ${time}`,
  ]
    .filter(Boolean)
    .join('\n');

  const steps = ['step1', 'step2', 'step3', 'step4'] as const;

  return (
    <div className="mt-6">
      {/* Indicateur d'étapes */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i + 1 <= step ? 'bg-brand' : 'bg-gray-200'}`} />
            <p className={`mt-1 text-xs ${i + 1 === step ? 'font-bold' : 'text-gray-500'}`}>
              {t(s)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        {/* Étape 1 : informations */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              {t('name')}
              <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              {t('phone')}
              <input
                className={inputClass}
                dir="ltr"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">
                {t('brand')}
                <input className={inputClass} value={form.brand} onChange={(e) => update('brand', e.target.value)} />
              </label>
              <label className="block text-sm font-medium">
                {t('model')}
                <input className={inputClass} value={form.model} onChange={(e) => update('model', e.target.value)} />
              </label>
            </div>
            <label className="block text-sm font-medium">
              {t('plate')}
              <input className={inputClass} dir="ltr" value={form.plate} onChange={(e) => update('plate', e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              {t('service')}
              <select className={inputClass} value={form.service} onChange={(e) => update('service', e.target.value)}>
                <option value="">{t('selectService')}</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {ts(`${s}.name`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Étape 2 : description du problème */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold">{t('describeTitle')}</h2>
            <p className="mt-1 text-sm text-gray-600">{t('describeHint')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => {
                const active = symptoms.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium ${
                      active ? 'border-brand bg-brand text-white' : 'border-gray-300 hover:bg-soft'
                    }`}
                  >
                    {t(`symptoms.${s}.label`)}
                  </button>
                );
              })}
            </div>
            <textarea
              className={`${inputClass} mt-4 h-28`}
              placeholder={t('describePlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        )}

        {/* Étape 3 : causes possibles */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold">{t('causesTitle')}</h2>
            {symptoms.length === 0 ? (
              <p className="mt-3 rounded-lg bg-soft p-4 text-sm">{t('noSymptom')}</p>
            ) : (
              <div className="mt-4 space-y-4">
                {symptoms.map((s) => (
                  <div key={s} className="rounded-xl border border-gray-200 p-4">
                    <h3 className="font-bold">{t(`symptoms.${s}.label`)}</h3>
                    <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-gray-700">
                      {(t.raw(`symptoms.${s}.causes`) as string[]).map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">{t('causesNote')}</p>
              </div>
            )}
          </div>
        )}

        {/* Étape 4 : créneau et confirmation */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold">{t('dateTitle')}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    date === d ? 'border-brand bg-brand text-white' : 'border-gray-300 hover:bg-soft'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <h2 className="mt-6 text-xl font-bold">{t('timeTitle')}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {TIMES.map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setTime(x)}
                  dir="ltr"
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    time === x ? 'border-brand bg-brand text-white' : 'border-gray-300 hover:bg-soft'
                  }`}
                >
                  {x}
                </button>
              ))}
            </div>

                        {date && time && !saved && (
              <div className="mt-8 rounded-xl bg-soft p-5">
                <h2 className="text-lg font-bold">{t('confirmTitle')}</h2>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm">{message}</pre>
                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
                <button
                  type="button"
                  onClick={submit}
                  disabled={saving}
                  className="btn-glow mt-4 rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                >
                  {saving ? t('saving') : t('confirmButton')}
                </button>
              </div>
            )}

            {saved && (
              <div className="mt-8 rounded-xl border border-green-500/40 bg-green-500/10 p-5">
                <h2 className="text-lg font-bold">✅ {t('savedTitle')}</h2>
                <p className="mt-2 text-sm text-gray-300">{t('savedText')}</p>
                <a
                  href={whatsappLink(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                >
                  {t('sendWhatsapp')}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-full border border-gray-300 px-6 py-2 font-medium hover:bg-soft"
          >
            {t('back')}
          </button>
        ) : (
          <span />
        )}
        {step < 4 && (
          <button
            type="button"
            disabled={step === 1 && !step1Valid}
            onClick={() => setStep(step + 1)}
            className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('next')}
          </button>
        )}
      </div>
    </div>
  );
}
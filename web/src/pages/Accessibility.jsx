import { useA11y } from "../core/a11y/A11yProvider";
import { useI18n } from "../core/i18n/I18nProvider";
import ReadAloud from "../core/a11y/ReadAloud";
import Button from "../core/ui/Button";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../core/ui/Card";

function Check({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 min-h-11 cursor-pointer rounded-lg px-2 hover:bg-surface-2">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-6 w-6" />
      <span className="text-fg">{label}</span>
    </label>
  );
}

export default function Accessibility() {
  const { prefs, update, reset } = useA11y();
  const { t, lang, setLang, languages } = useI18n();
  const sizes = [["normal", "Normal"], ["large", "Large"], ["xlarge", "Extra large"]];

  return (
    <div>
      <PageHeader title={t("a11y_title", "Accessibility settings")} description={t("a11y_desc", "Changes apply right away and are saved to your account.")} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={t("a11y_text_size", "Text size")} />
          <CardBody>
            <fieldset>
              <legend className="sr-only">{t("a11y_text_size", "Text size")}</legend>
              {sizes.map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 min-h-11 cursor-pointer rounded-lg px-2 hover:bg-surface-2">
                  <input type="radio" name="textSize" value={value} checked={prefs.textSize === value}
                    onChange={() => update({ textSize: value })} className="h-6 w-6" />
                  <span className="text-fg">{label}</span>
                </label>
              ))}
            </fieldset>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t("a11y_display", "Display")} />
          <CardBody className="space-y-1">
            <Check id="dark" label={t("a11y_dark", "Dark mode")} checked={prefs.dark} onChange={(v) => update({ dark: v })} />
            <Check id="hc" label={t("a11y_contrast", "High contrast")} checked={prefs.contrast} onChange={(v) => update({ contrast: v })} />
            <Check id="motion" label={t("a11y_reduce_motion", "Reduce motion")} checked={prefs.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
            <Check id="dys" label={t("a11y_dyslexia", "Dyslexia-friendly spacing")} checked={prefs.dyslexia} onChange={(v) => update({ dyslexia: v })} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t("a11y_tts_speed", "Read aloud speed")} />
          <CardBody>
            <label htmlFor="tts-rate" className="mb-1 block font-medium text-fg">
              Speed: {(prefs.ttsRate || 1).toFixed(1)}×
            </label>
            <input id="tts-rate" type="range" min="0.7" max="1.5" step="0.1" value={prefs.ttsRate || 1}
              onChange={(e) => update({ ttsRate: Number(e.target.value) })} className="w-full" aria-label={t("a11y_tts_speed", "Read aloud speed")} />
            <p className="text-xs text-fg-muted">Used by the Read aloud buttons and the read-page button in the top bar.</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t("language", "Language")} />
          <CardBody>
            <label htmlFor="language" className="mb-1 block font-medium text-fg">{t("language", "Language")}</label>
            <select id="language" value={lang} onChange={(e) => setLang(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 min-h-11 text-fg">
              {Object.entries(languages).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-fg-muted">
              The navigation and main screens are translated; other text falls back to English.
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button variant="secondary" onClick={reset}>{t("a11y_reset", "Reset to defaults")}</Button>
        <ReadAloud text="This is a sample of the read aloud feature. You can use it on notifications." label={t("a11y_hear_sample", "Hear a sample")} />
      </div>
    </div>
  );
}

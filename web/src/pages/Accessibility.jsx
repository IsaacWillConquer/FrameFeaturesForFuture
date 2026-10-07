import { useA11y } from "../core/a11y/A11yProvider";
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
  const sizes = [["normal", "Normal"], ["large", "Large"], ["xlarge", "Extra large"]];

  return (
    <div>
      <PageHeader title="Accessibility settings" description="Changes apply right away and are saved to your account." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Text size" />
          <CardBody>
            <fieldset>
              <legend className="sr-only">Text size</legend>
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
          <CardHeader title="Display" />
          <CardBody className="space-y-1">
            <Check id="dark" label="Dark mode" checked={prefs.dark} onChange={(v) => update({ dark: v })} />
            <Check id="hc" label="High contrast" checked={prefs.contrast} onChange={(v) => update({ contrast: v })} />
            <Check id="motion" label="Reduce motion" checked={prefs.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
            <Check id="dys" label="Dyslexia-friendly spacing" checked={prefs.dyslexia} onChange={(v) => update({ dyslexia: v })} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Read aloud speed" />
          <CardBody>
            <label htmlFor="tts-rate" className="mb-1 block font-medium text-fg">
              Speed: {(prefs.ttsRate || 1).toFixed(1)}×
            </label>
            <input id="tts-rate" type="range" min="0.7" max="1.5" step="0.1" value={prefs.ttsRate || 1}
              onChange={(e) => update({ ttsRate: Number(e.target.value) })} className="w-full" aria-label="Read aloud speed" />
            <p className="text-xs text-fg-muted">Used by the Read aloud buttons and the read-page button in the top bar.</p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button variant="secondary" onClick={reset}>Reset to defaults</Button>
        <ReadAloud text="This is a sample of the read aloud feature. You can use it on notifications." label="Hear a sample" />
      </div>
    </div>
  );
}

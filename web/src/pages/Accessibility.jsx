import { useA11y } from "../core/a11y/A11yProvider";
import ReadAloud from "../core/a11y/ReadAloud";
import Button from "../core/ui/Button";

function Check({ id, label, checked, onChange }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="flex items-center gap-3 min-h-11">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-6 h-6" />
        {label}
      </label>
    </div>
  );
}

export default function Accessibility() {
  const { prefs, update, reset } = useA11y();
  const sizes = [["normal", "Normal"], ["large", "Large"], ["xlarge", "Extra large"]];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Accessibility settings</h1>
      <p className="mb-4">Changes apply right away and are saved to your account.</p>

      <fieldset className="mb-4">
        <legend className="font-medium mb-2">Text size</legend>
        {sizes.map(([value, label]) => (
          <label key={value} className="flex items-center gap-3 min-h-11">
            <input type="radio" name="textSize" value={value} checked={prefs.textSize === value}
              onChange={() => update({ textSize: value })} className="w-6 h-6" />
            {label}
          </label>
        ))}
      </fieldset>

      <Check id="dark" label="Dark mode" checked={prefs.dark} onChange={(v) => update({ dark: v })} />
      <Check id="hc" label="High contrast" checked={prefs.contrast} onChange={(v) => update({ contrast: v })} />
      <Check id="motion" label="Reduce motion" checked={prefs.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
      <Check id="dys" label="Dyslexia-friendly spacing" checked={prefs.dyslexia} onChange={(v) => update({ dyslexia: v })} />

      <div className="flex flex-wrap gap-4 mt-4 items-center">
        <Button onClick={reset}>Reset to defaults</Button>
        <ReadAloud text="This is a sample of the read aloud feature. You can use it on notifications." label="Hear a sample" />
      </div>
    </div>
  );
}

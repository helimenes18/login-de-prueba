/**
 * AGREGADO: componente <ToggleSwitch>.
 * PARA QUÉ SIRVE: antes, en configuracion.html, los interruptores solo cambiaban una
 * clase CSS con onclick="this.classList.toggle('active')" pero no guardaban nada en
 * ningún lado. Ahora es un componente controlado: recibe "checked" y "onChange",
 * así que su estado vive en SettingsContext (ver src/context/SettingsContext.jsx) y
 * sí persiste de verdad (en localStorage, mientras no haya backend).
 */
export default function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="toggle-row">
      <div className="info">
        {label}
        {description && <div className="desc">{description}</div>}
      </div>
      <div
        className={'toggle-switch' + (checked ? ' active' : '')}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <div className="thumb"></div>
      </div>
    </div>
  );
}

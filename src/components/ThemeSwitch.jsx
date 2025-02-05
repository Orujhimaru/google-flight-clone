import { SunIcon, MoonIcon } from "./Icons";

export const ThemeSwitch = ({ theme, onToggle }) => {
  console.log("Current theme:", theme);
  return (
    <button
      className="theme-switch"
      onClick={onToggle}
      aria-label="Toggle theme"
    >
      <div className={`switch-container ${theme}`}>
        <span className="sun">
          <SunIcon />
        </span>
        <span className="moon">
          <MoonIcon />
        </span>
        <div className="switch-circle"></div>
      </div>
    </button>
  );
};

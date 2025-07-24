import React, { useState, useMemo } from "react";
import "./CodeSandboxEmbed.css";

/**
 * Props:
 *   template → one of:
 *      react  | react-ts | vanilla | vanilla-ts | node
 *      vue    | svelte   | angular | nextjs     | remix
 *   title    → heading text
 */
export default function CodeSandboxEmbed({
  template = "react",
  title = "CodeSandbox Playground"
}) {
  /* Generate the URL once per mount (prevents React 18 remount warn) */
  const url = useMemo(() => {
    const params = new URLSearchParams({
      template,
      view: "editor",
      fontsize: "14",
      hidenavigation: "1",
      autoresize: "1",
      // you can add theme=dark etc.
    }).toString();
    return `https://codesandbox.io/embed/new?${params}`;
  }, [template]);

  /* Force iframe reload on template change (optional) */
  const [key, setKey] = useState(0);
  const changeTemplate = (e) => {
    setKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="csb-wrapper">
      <header className="csb-header">
        <h3>{title}</h3>
        <select value={template} onChange={changeTemplate}>
          <option value="react">React</option>
          <option value="react-ts">React + TS</option>
          <option value="vanilla">Vanilla JS</option>
          <option value="vanilla-ts">Vanilla TS</option>
          <option value="node">Node</option>
          <option value="vue">Vue 3</option>
          <option value="svelte">Svelte</option>
          <option value="angular">Angular</option>
          <option value="nextjs">Next.js</option>
        </select>
        <a
          href={url.replace("/embed/", "/")}
          target="_blank"
          rel="noreferrer"
          className="csb-open"
        >
          Open Fullscreen ↗
        </a>
      </header>

      <iframe
        key={key}         /* reload when template changes */
        src={url}
        title="codesandbox"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
}

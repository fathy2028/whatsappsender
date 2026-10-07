/**
 * Fixed, animated aurora backdrop. Rendered once per page behind all content.
 * Pure CSS (see styles/global.css) so it costs no JS on the main thread.
 */
function AuroraBackground() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora__blob aurora__blob--1" />
      <div className="aurora__blob aurora__blob--2" />
      <div className="aurora__blob aurora__blob--3" />
      <div className="aurora__grid" />
      <div className="aurora__vignette" />
    </div>
  );
}

export default AuroraBackground;

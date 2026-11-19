/**
 * Prints an HTML document through an off-screen iframe (no pop-up blockers).
 * The browser's print dialog lets the user choose "Save as PDF".
 *
 * The frame is kept off-screen at a real page size. A 0×0 or `visibility:hidden`
 * frame makes Firefox/Safari print a blank page, which is why this used to "do nothing".
 */
export function printHtml(html: string): boolean {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;opacity:0;pointer-events:none";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    return false;
  }

  let removed = false;
  const cleanup = () => {
    if (removed) return;
    removed = true;
    setTimeout(() => iframe.remove(), 500);
  };

  doc.open();
  doc.write(html);
  doc.close();
  win.addEventListener("afterprint", cleanup);

  // Wait for fonts/layout, then print. Clean up even if the dialog is dismissed silently.
  const fontsReady: Promise<unknown> = doc.fonts?.ready ?? Promise.resolve();
  fontsReady
    .catch(() => undefined)
    .then(() => {
      setTimeout(() => {
        try {
          win.focus();
          win.print();
        } catch {
          cleanup();
        }
      }, 100);
    });
  setTimeout(cleanup, 5 * 60_000);
  return true;
}

export const escapeHtml = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

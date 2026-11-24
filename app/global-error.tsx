"use client";

/**
 * Last resort: shown when a root layout itself fails, so it brings its own
 * document and cannot use translations or shared providers. Page errors are
 * handled by `app/(frontend)/[locale]/error.tsx`.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="cs">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <main>
          <h1 style={{ fontSize: "1.5rem" }}>Něco se pokazilo</h1>
          <p>Something went wrong. Zkuste to prosím znovu. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Zkusit znovu / Try again
          </button>
        </main>
      </body>
    </html>
  );
}

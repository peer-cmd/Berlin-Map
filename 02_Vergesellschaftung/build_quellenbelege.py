"""Render quellenbelege.md as quellenbelege.html (standard library only).

quellenbelege.md stays the source; run this script after editing it:
    python3 build_quellenbelege.py
One column: '## year' becomes h2, '### document' h3, and '- **Lead:** text'
a paragraph with a bold lead (no bullet list).
Inline: **bold**, *italic*, `code`, [links](url).
"""
import html
import re
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "quellenbelege.md"
OUT = HERE / "quellenbelege.html"

PAGE = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Die Chronologie — Vergesellschaftung großer Wohnungsunternehmen</title>
<link rel="stylesheet" href="fonts/fonts.css">
<link rel="stylesheet" href="style.css?v=20261005b">
</head>
<body class="chron-page">
<!-- Generated from quellenbelege.md by build_quellenbelege.py. Do not edit by hand. -->
<div class="app">

  <nav class="site-nav">
    <a href="index.html">Übersicht</a>
    <a href="modell-kompakt.html">Modell</a>
    <a href="recht.html">Das Recht</a>
    <a href="zahlen.html">Die Zahlen</a>
    <a href="quellenbelege.html" class="active">Die Chronologie</a>
    <a href="glossar.html">Glossar</a>
    <a href="karte.html">Karte</a>
  </nav>

  <div class="masthead">
    <div>
      <h1>{title}</h1>
    </div>
  </div>

  <div class="bg-page">
{body}
  </div>

  <div class="colophon">Die Chronologie — Vergesellschaftung großer Wohnungsunternehmen · <a href="quellen.html">Quellen</a> · <a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a></div>

</div>
<script src="nav.js?v=20261005a"></script>
</body>
</html>
"""


def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    return text


def convert(lines):
    """Intro paragraph as lead, '## year' as h2, '### document' as h3,
    '- **Lead:** text' as a paragraph starting with the bold lead (no list)."""
    out, title, i = [], "Die Chronologie", 0
    first = True
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith("# "):
            title = inline(line[2:])
            i += 1
            continue
        m = re.match(r"(#{2,3}) (.*)", line)
        if m:
            level = len(m.group(1))
            out.append(f"<h{level}>{inline(m.group(2))}</h{level}>")
            i += 1
            continue
        if line.startswith("- "):
            out.append(f"<p>{inline(line[2:])}</p>")
            i += 1
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r"(#{1,3} |- )", lines[i]):
            para.append(lines[i].strip())
            i += 1
        cls = ' class="lead"' if first else ""
        first = False
        out.append(f"<p{cls}>{inline(' '.join(para))}</p>")
    return title, "\n".join("    " + o for o in out)


def main():
    title, body = convert(SRC.read_text(encoding="utf-8").splitlines())
    OUT.write_text(PAGE.format(title=title, body=body), encoding="utf-8")
    print(f"wrote {OUT.name}")


if __name__ == "__main__":
    main()

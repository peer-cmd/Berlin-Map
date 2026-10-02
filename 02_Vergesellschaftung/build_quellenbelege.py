"""Render quellenbelege.md as quellenbelege.html (standard library only).

quellenbelege.md stays the source; run this script after editing it:
    python3 build_quellenbelege.py
Layout as on the Glossar page: '## year' becomes a letter head, '### document'
with its paragraph a glossary entry, '- **Lead:** text' an indented point.
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
<link rel="stylesheet" href="style.css?v=20261002n">
</head>
<body>
<!-- Generated from quellenbelege.md by build_quellenbelege.py. Do not edit by hand. -->
<div class="app">

  <nav class="site-nav">
    <a href="index.html">Übersicht</a>
    <a href="modell-kompakt.html">Modell</a>
    <a href="hintergrund.html">Hintergrund</a>
    <a href="zahlen.html">Die Zahlen</a>
    <a href="glossar.html">Glossar</a>
    <a href="quellenbelege.html" class="active">Die Chronologie</a>
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

  <div class="colophon">Die Chronologie — Vergesellschaftung großer Wohnungsunternehmen</div>

</div>
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


def entry(term, text):
    return f"<div><dt>{inline(term)}</dt> <dd>{inline(text)}</dd></div>"


def convert(lines):
    """Intro paragraph, then glossary-style blocks: '## year' is a letter head,
    '### document' plus its paragraph is an entry, '- **Lead:** text' a point."""
    out, title, i, opened = [], "Die Chronologie", 0, False
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith("# "):
            title = inline(line[2:])
            i += 1
            continue
        if line.startswith("## "):
            if not opened:
                out.append('<div class="glossary chronik">')
                opened = True
            out.append(f'<div class="gl-letter">{inline(line[3:])}</div>')
            i += 1
            continue
        if line.startswith("### "):
            term, i = line[4:], i + 1
            while i < len(lines) and not lines[i].strip():
                i += 1
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(r"(#{1,3} |- )", lines[i]):
                para.append(lines[i].strip())
                i += 1
            out.append(f"<dl>{entry(term, ' '.join(para))}</dl>")
            continue
        if line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                m = re.match(r"- \*\*(.+?)\*\*\s*(.*)", lines[i])
                items.append(entry(m.group(1), m.group(2)) if m else f"<div><dd>{inline(lines[i][2:])}</dd></div>")
                i += 1
            out.append('<dl class="gl-points">' + "".join(items) + "</dl>")
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r"(#{1,3} |- )", lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append(f'<p class="lead">{inline(" ".join(para))}</p>')
    if opened:
        out.append("</div>")
    return title, "\n".join("    " + o for o in out)


def main():
    title, body = convert(SRC.read_text(encoding="utf-8").splitlines())
    OUT.write_text(PAGE.format(title=title, body=body), encoding="utf-8")
    print(f"wrote {OUT.name}")


if __name__ == "__main__":
    main()

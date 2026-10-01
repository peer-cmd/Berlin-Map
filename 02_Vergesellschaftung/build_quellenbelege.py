"""Render quellenbelege.md as quellenbelege.html (standard library only).

quellenbelege.md stays the source; run this script after editing it:
    python3 build_quellenbelege.py
Supports the Markdown the file uses: headings, paragraphs, bullet lists
(one nesting level), numbered lists, pipe tables, **bold**, *italic*, `code`.
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
<title>Quellenbelege — Vergesellschaftung großer Wohnungsunternehmen</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<!-- Generated from quellenbelege.md by build_quellenbelege.py. Do not edit by hand. -->
<div class="app">

  <nav class="site-nav">
    <a href="index.html">Übersicht</a>
    <a href="vergesellschaftung-modell-v37.html">Modell</a>
    <a href="modell-kompakt.html">Modell (kompakt)</a>
    <a href="zahlen.html">Die Zahlen erklärt</a>
    <a href="glossar.html">Glossar</a>
    <a href="quellenbelege.html" class="active">Quellenbelege</a>
  </nav>

  <div class="masthead">
    <div>
      <h1>{title}</h1>
    </div>
  </div>

  <div class="bg-page">
{body}
  </div>

  <div class="colophon">Quellenbelege — Vergesellschaftung großer Wohnungsunternehmen</div>

</div>
</body>
</html>
"""


def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    return text


def cells(row):
    return [c.strip() for c in row.strip().strip("|").split("|")]


def convert(lines):
    out, title, i = [], "Quellenbelege", 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        m = re.match(r"(#{1,3}) (.*)", line)
        if m:
            level = len(m.group(1))
            if level == 1:
                title = inline(m.group(2))
            else:
                out.append(f"<h{level}>{inline(m.group(2))}</h{level}>")
            i += 1
            continue
        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append(lines[i])
                i += 1
            head = "".join(f"<th>{inline(c)}</th>" for c in cells(rows[0]))
            body = "".join(
                "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in cells(r)) + "</tr>"
                for r in rows[2:]
            )
            out.append(f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>")
            continue
        if re.match(r"(- |\d+\. )", line):
            tag = "ul" if line.startswith("- ") else "ol"
            items = []
            while i < len(lines) and re.match(r"(\s*- |\d+\. )", lines[i]):
                item = lines[i]
                if item.startswith("  "):
                    items[-1][1].append(inline(item.strip()[2:]))
                else:
                    items.append([inline(re.sub(r"^(- |\d+\. )", "", item)), []])
                i += 1
            lis = []
            for text, subs in items:
                sub = "<ul>" + "".join(f"<li>{s}</li>" for s in subs) + "</ul>" if subs else ""
                lis.append(f"<li>{text}{sub}</li>")
            out.append(f"<{tag}>" + "".join(lis) + f"</{tag}>")
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r"(#{1,3} |\||- |\d+\. )", lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append(f"<p>{inline(' '.join(para))}</p>")
    return title, "\n".join("    " + o for o in out)


def main():
    title, body = convert(SRC.read_text(encoding="utf-8").splitlines())
    OUT.write_text(PAGE.format(title=title, body=body), encoding="utf-8")
    print(f"wrote {OUT.name}")


if __name__ == "__main__":
    main()

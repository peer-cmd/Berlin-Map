"""Generate modell-kompakt.html from vergesellschaftung-modell-v37.html.

The compact page is the full model without the background column. Edit only
the full model page, then run:
    python3 build_kompakt.py
"""
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "vergesellschaftung-modell-v37.html"
OUT = HERE / "modell-kompakt.html"

BG_START = '  <div class="bg-col"><div class="bg-page">'
BG_END = "  </div></div>\n"


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise SystemExit(f"expected exactly one occurrence of: {old!r}")
    return text.replace(old, new)


def main():
    s = SRC.read_text(encoding="utf-8")
    s = replace_once(s, "Vergesellschaftung Berlin</title>", "Vergesellschaftung Berlin — kompakt</title>")
    s = replace_once(s, '<div class="layout">', '<div class="layout no-bg">')
    start = s.index(BG_START)
    end = s.index(BG_END, start) + len(BG_END)
    s = s[:start] + s[end:]
    s = replace_once(s, '<script src="include.js"></script>\n', "")
    s = s.replace('<body class="model-page">\n', '<body class="model-page">\n' "<!-- Generated from vergesellschaftung-modell-v37.html by build_kompakt.py. Do not edit by hand. -->\n", 1)
    OUT.write_text(s, encoding="utf-8")
    print(f"wrote {OUT.name}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Convert PDFs to Markdown.

Fast path: `pdftotext -layout` (poppler) for full text, split into
pages on the form-feed character poppler inserts between pages.
Slow path (optional, --tables): pdfplumber table detection, added
as an appendix per page where tables are found. Off by default
because it is far slower on large/scanned PDFs.

Usage:
    python3 pdf_to_markdown.py <input_dir> <output_dir> [--tables] [--only NAME.pdf]
"""

import sys
import subprocess
from pathlib import Path


def pdftotext_layout(pdf_path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        capture_output=True, text=True, timeout=170,
    )
    return result.stdout


def convert_pdf(pdf_path: Path, out_path: Path, with_tables: bool):
    raw = pdftotext_layout(pdf_path)
    pages = raw.split("\x0c")
    # trailing empty page from final form feed
    if pages and pages[-1].strip() == "":
        pages = pages[:-1]
    n_pages = len(pages)

    md_parts = [f"# {pdf_path.stem}\n\nSource file: {pdf_path.name}\nPages: {n_pages}\n"]

    tables_by_page = {}
    if with_tables:
        import pdfplumber

        def table_to_markdown(table):
            if not table or not any(any(cell for cell in row) for row in table):
                return ""
            rows = [[("" if c is None else str(c).replace("\n", " ").strip()) for c in row] for row in table]
            header, body = rows[0], rows[1:]
            ncols = len(header)
            lines = ["| " + " | ".join(header) + " |", "|" + "|".join(["---"] * ncols) + "|"]
            for row in body:
                row = row + [""] * (ncols - len(row))
                lines.append("| " + " | ".join(row[:ncols]) + " |")
            return "\n".join(lines)

        with pdfplumber.open(str(pdf_path)) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                mds = [table_to_markdown(t) for t in page.extract_tables()]
                mds = [m for m in mds if m]
                if mds:
                    tables_by_page[i] = mds

    for i, page_text in enumerate(pages, start=1):
        md_parts.append(f"\n---\n\n## Page {i}/{n_pages}\n")
        text = page_text.rstrip()
        if text:
            md_parts.append(text)
        for t_idx, md_table in enumerate(tables_by_page.get(i, []), start=1):
            md_parts.append(f"\n**Table {i}.{t_idx}**\n\n{md_table}\n")

    out_path.write_text("\n".join(md_parts), encoding="utf-8")
    return n_pages


def main():
    args = sys.argv[1:]
    with_tables = "--tables" in args
    args = [a for a in args if a != "--tables"]
    only = None
    if "--only" in args:
        idx = args.index("--only")
        only = args[idx + 1]
        args = args[:idx] + args[idx + 2:]

    if len(args) != 2:
        print("Usage: python3 pdf_to_markdown.py <input_dir> <output_dir> [--tables] [--only NAME.pdf]")
        sys.exit(1)

    in_dir = Path(args[0])
    out_dir = Path(args[1])
    out_dir.mkdir(parents=True, exist_ok=True)

    pdfs = sorted(in_dir.glob("*.pdf"))
    if only:
        pdfs = [p for p in pdfs if p.name == only]
    if not pdfs:
        print(f"No matching PDFs found in {in_dir}")
        sys.exit(1)

    for pdf_path in pdfs:
        out_path = out_dir / (pdf_path.stem + ".md")
        try:
            n_pages = convert_pdf(pdf_path, out_path, with_tables)
            print(f"OK  {pdf_path.name}  ({n_pages} pages) -> {out_path.name}", flush=True)
        except Exception as e:
            print(f"FAIL {pdf_path.name}: {e}", flush=True)


if __name__ == "__main__":
    main()

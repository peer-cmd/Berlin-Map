#!/usr/bin/env python3
"""
corpus_search.py — reusable keyword search over a BibTeX library + PDF corpus.

Built for Peer's Biblex (`My Collection_All.bib`) and the 07_THEORIE PDF
library, scoped by default to the 08_Vergesellschaftung project, but the
paths and keyword list are all parameters, so it can be repointed at any
project/keyword set later.

Two-stage search, per the bibtex-pdf-corpus-research method:
  1. Search the .bib file's metadata fields (title, author, abstract,
     keywords, annote, journal, booktitle) for the keyword list.
  2. Separately sweep 07_THEORIE filenames for keyword hits not already
     resolved via the bib file (catches misfiled / unindexed PDFs).

Output: one JSON file with all matches, each traceable back to a bib key
or a file path, the field/keyword that matched, and whether the resolved
file is already present in the project's own pdf/ folder.

Usage:
    python3 corpus_search.py --config search_config.json --out results.json
    python3 corpus_search.py --keywords "Vergesellschaftung,Art. 15 GG,..." --out results.json

Nothing in the .bib file or 07_THEORIE is modified — read-only throughout.
"""

import argparse
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

# ---------------------------------------------------------------------------
# Defaults (overridable via --config / CLI flags)
# ---------------------------------------------------------------------------

DEFAULT_BIB_PATHS = [
    "/root/mnt/08_Vergesellschaftung/My Collection_All.bib",
]
DEFAULT_THEORIE_ROOT = "/root/mnt/07_THEORIE"
DEFAULT_PROJECT_PDF_DIR = "/root/mnt/08_Vergesellschaftung/pdf"

# Project keyword set for Vergesellschaftung (Art. 15 GG housing socialization
# model). v2: drawn from the project's own glossar.html / quellenbelege.md
# *and* a close read of vergesellschaftung-modell-v37.html + zahlen.html
# (the model's parameters, cited studies, and its own "Offene Punkte" gap
# list) — reoriented toward (a) housing/real-estate economics that could
# tighten specific model parameters, and (b) historical precedent for
# Art. 15 GG socialization, since the model notes the article has never
# been applied and its legal/economic precedent is thin. Bare surname
# keywords ("Holm") were dropped: they matched unrelated people (Sherlock
# Holmes, Thorsten Holm, Lorens Holm, Knud Lonberg-Holm) far more than the
# actual Bernt/Holm (2023) study — replaced with the fuller name/phrase forms.
DEFAULT_KEYWORDS = [
    # -- core legal/constitutional --
    "Vergesellschaftung",
    "Art. 15 GG", "Artikel 15 GG", "Art 15 GG",
    "Art. 14 GG", "Sozialisierung",
    "Enteignung", "Entschädigung", "Entschädigungsquote",
    "Sozialbindung", "Belegungsbindung", "Kappungsgrenze",
    "Rekommunalisierung", "Vergesellschaftungsgesetz",
    "Gemeinwirtschaft", "Gemeinwohlorientierung",
    "Wohnungsunternehmen", "Wohnungspolitik", "Wohnraumversorgung",
    "AöR", "Anstalt öffentlichen Rechts",
    "Deutsche Wohnen enteignen", "DWE",
    "Expertenkommission Vergesellschaftung",
    "Mietendeckel", "Bestandsmiete", "Neuvertragsmiete",
    "Nettobetriebsergebnis", "NOI",
    "Genossenschaft", "gemeinnützig", "Wohngemeinnützigkeit",
    "socialization of housing",
    # -- named studies/people actually cited in the model (full forms only) --
    "Bernt/Holm", "Andrej Holm", "Matthias Bernt",
    "Rosa-Luxemburg-Stiftung",
    "Voigtländer", "Deschermeier",
    "Institut der deutschen Wirtschaft Köln", "IW Köln",
    "Gutachterausschuss für Grundstückswerte",
    "Rechnungshof Berlin",
    # -- valuation / real-estate & housing economics (model's own mechanics) --
    "Ertragswertverfahren", "Vergleichswertverfahren", "Liegenschaftszins",
    "Kapitalisierungszins", "Diskontierungszins", "Diskontsatz",
    "Immobilienbewertung", "Immobilienökonomie", "Wohnungsmarktökonomie",
    "Bodenwert", "Bodenrichtwert", "Grundstückswert",
    "ImmoWertV",
    "Risikoprämie", "Kapitalflucht", "regulatory taking",
    "expropriation risk premium", "political risk premium", "sovereign risk",
    "just compensation", "eminent domain", "expropriation",
    "nationalization", "nationalisation",
    "rent control", "Mietregulierung",
    "social discount rate", "gesellschaftlicher Diskontsatz",
    "Kommunalkredit", "Staatsverschuldung", "öffentliche Investitionen",
    # -- historical precedent for socialization (the model's stated gap) --
    "Sozialisierungsgesetz", "Sozialisierung 1919", "Kohlesozialisierung",
    "Verstaatlichung Kohle", "Rätebewegung", "Bodenreform", "Lastenausgleich",
    "municipalization", "municipalisation", "Gemeindebau", "Rotes Wien",
    "council housing", "public housing", "social housing",
    "New Deal", "urban renewal",
    "Parlamentarischer Rat", "Grundgesetz Entstehungsgeschichte",
    # -- broad housing-market / housing-economics terms (v3 — the narrow
    #    compound phrases in v2, e.g. "public housing finance", missed
    #    plain-English titles entirely; these are deliberately generic) --
    "housing market", "housing markets", "housing policy",
    "housing institutions", "housing affordability",
    "real estate market", "real estate markets", "housing finance",
    "housing crisis",
    # -- cooperative / mutual housing & worker-cooperative economics --
    "cooperative housing", "housing cooperative", "worker cooperative",
    "worker co-operative", "Mondragon", "Rochdale",
]

BIB_FIELDS_TO_SEARCH = [
    "title", "author", "abstract", "keywords", "annote",
    "journal", "booktitle", "note",
]

# Some entries in this library carry corrupted metadata: a "keywords" field
# (rarely another field) containing a multi-thousand-character dump of
# unrelated terms apparently merged in from a different record (observed
# e.g. on key "Rongcai2009", an 1848-revolution history book whose
# "keywords" field is actually ~35,000 chars of unrelated urban-planning/
# hydrology terms — an artifact of an earlier corpus reconciliation, not a
# real description of that book). A field longer than this is almost
# certainly such a dump rather than a genuine author-assigned keyword list,
# so it's excluded from matching and the entry is flagged instead of
# silently treated as a real hit. Per the corpus-research method: log data
# quality problems, don't silently "fix" or hide them.
MAX_FIELD_CHARS_FOR_MATCH = 1200


# ---------------------------------------------------------------------------
# Lightweight BibTeX parsing (no external deps — bibtexparser not installed
# on this machine). Entries are split at top-level "@type{key," markers and
# fields are extracted with brace-balancing, since titles/abstracts often
# contain nested {…} groups that a naive regex would truncate.
# ---------------------------------------------------------------------------

ENTRY_START_RE = re.compile(r"@(\w+)\s*\{\s*([^,\s]+)\s*,", re.MULTILINE)


def split_entries(bib_text):
    """Yield (entry_type, entry_key, entry_body_text) for each top-level entry."""
    starts = list(ENTRY_START_RE.finditer(bib_text))
    for i, m in enumerate(starts):
        entry_type = m.group(1)
        entry_key = m.group(2)
        body_start = m.end()
        body_end = starts[i + 1].start() if i + 1 < len(starts) else len(bib_text)
        yield entry_type, entry_key, bib_text[body_start:body_end]


FIELD_START_RE = re.compile(r"(\w+)\s*=\s*")


def extract_fields(entry_body):
    """Extract field->value pairs from an entry body, balancing {} and handling "..." values."""
    fields = {}
    pos = 0
    length = len(entry_body)
    for m in FIELD_START_RE.finditer(entry_body):
        if m.start() < pos:
            continue  # already consumed as part of a previous value
        field_name = m.group(1).lower()
        val_start = m.end()
        if val_start >= length:
            continue
        ch = entry_body[val_start]
        if ch == "{":
            depth = 1
            j = val_start + 1
            while j < length and depth > 0:
                if entry_body[j] == "{":
                    depth += 1
                elif entry_body[j] == "}":
                    depth -= 1
                j += 1
            value = entry_body[val_start + 1:j - 1]
            pos = j
        elif ch == '"':
            j = val_start + 1
            while j < length and entry_body[j] != '"':
                j += 1
            value = entry_body[val_start + 1:j]
            pos = j + 1
        else:
            # bare value (e.g. a number) up to next comma
            j = entry_body.find(",", val_start)
            if j == -1:
                j = length
            value = entry_body[val_start:j].strip()
            pos = j
        fields[field_name] = value.strip()
    return fields


FILE_FIELD_RE = re.compile(r":?(.*?):(?:pdf|PDF)?$")


def parse_file_field(raw):
    """
    Zotero/Mendeley-style file field, e.g.:
      ':C\\:/07_THEORIE/Foo/bar.pdf:pdf'
    Possibly multiple entries separated by ';'. Returns a list of raw path
    strings (Windows-style, as stored in the .bib).
    """
    if not raw:
        return []
    paths = []
    for part in raw.split(";"):
        part = part.strip()
        if not part:
            continue
        m = FILE_FIELD_RE.match(part)
        candidate = m.group(1) if m else part
        candidate = candidate.strip(":").strip()
        candidate = candidate.replace("\\:", ":")
        if candidate:
            paths.append(candidate)
    return paths


def windows_path_to_local(win_path, mount_map):
    """
    Map a Windows path as stored in the .bib (e.g. C:/07_THEORIE/x/y.pdf or
    C:\\Project Files\\08_Vergesellschaftung\\z.pdf) to a path under this
    machine's mounted folders, using mount_map: {"C:/07_THEORIE": "/root/mnt/07_THEORIE", ...}.
    Returns None if no mount matches.
    """
    normalized = win_path.replace("\\", "/")
    for win_root, local_root in mount_map.items():
        win_root_norm = win_root.replace("\\", "/")
        if normalized.lower().startswith(win_root_norm.lower()):
            rest = normalized[len(win_root_norm):].lstrip("/")
            return str(Path(local_root) / rest)
    return None


# ---------------------------------------------------------------------------
# Matching
# ---------------------------------------------------------------------------

def fold(s):
    """Casefold + strip diacritics for loose matching."""
    if not s:
        return ""
    nfkd = unicodedata.normalize("NFKD", s)
    ascii_ish = "".join(c for c in nfkd if not unicodedata.combining(c))
    return ascii_ish.casefold()


def build_keyword_matchers(keywords):
    """
    Word-boundary regex per keyword, built on the folded (diacritic-stripped,
    casefolded) form. Plain substring matching was tried first and rejected:
    short/acronym keywords like "DWE", "NOI", "Holm" matched as substrings
    inside unrelated words ("Holm" inside "Holmes", "DWE" inside "midweek"-
    style strings), producing mostly noise. \\b...\\b on the folded text
    avoids that for both short acronyms and multi-word phrases.
    """
    matchers = []
    for kw in keywords:
        folded = fold(kw)
        pattern = r"\b" + re.escape(folded).replace(r"\ ", r"\s+") + r"\b"
        matchers.append((kw, re.compile(pattern)))
    return matchers


def match_text(text, matchers):
    """Return list of original keyword strings whose word-boundary pattern matches text."""
    if not text:
        return []
    folded = fold(text)
    return [kw for kw, pattern in matchers if pattern.search(folded)]


# ---------------------------------------------------------------------------
# Main search
# ---------------------------------------------------------------------------

def search_bib(bib_paths, matchers, mount_map):
    """Returns list of match dicts, one per (entry, field-with-hit)."""
    results = []
    for bib_path in bib_paths:
        bib_path = Path(bib_path)
        if not bib_path.exists():
            print(f"  ! bib file not found, skipping: {bib_path}", file=sys.stderr)
            continue
        text = bib_path.read_text(encoding="utf-8", errors="replace")
        entry_count = 0
        for entry_type, entry_key, body in split_entries(text):
            entry_count += 1
            fields = extract_fields(body)
            hit_fields = {}
            oversized_fields = []
            for f in BIB_FIELDS_TO_SEARCH:
                if f in fields:
                    if len(fields[f]) > MAX_FIELD_CHARS_FOR_MATCH:
                        oversized_fields.append(f)
                        continue
                    hits = match_text(fields[f], matchers)
                    if hits:
                        hit_fields[f] = hits
            if not hit_fields:
                continue

            all_keywords_hit = sorted({kw for hits in hit_fields.values() for kw in hits})

            file_paths_local = []
            file_paths_raw = []
            if "file" in fields:
                for raw_path in parse_file_field(fields["file"]):
                    file_paths_raw.append(raw_path)
                    local = windows_path_to_local(raw_path, mount_map)
                    if local:
                        file_paths_local.append(local)

            results.append({
                "source": "bib",
                "bib_file": str(bib_path),
                "entry_type": entry_type,
                "key": entry_key,
                "title": fields.get("title", "").replace("{", "").replace("}", ""),
                "author": fields.get("author", ""),
                "year": fields.get("year", ""),
                "journal": fields.get("journal") or fields.get("booktitle") or "",
                "matched_keywords": all_keywords_hit,
                "matched_fields": hit_fields,
                "file_paths_raw": file_paths_raw,
                "file_paths_local": file_paths_local,
                "file_exists": [os.path.exists(p) for p in file_paths_local],
                "oversized_fields_skipped": oversized_fields,
            })
        print(f"  scanned {entry_count} entries in {bib_path.name}", file=sys.stderr)
    return results


def sweep_filenames(theorie_root, matchers, already_matched_local_paths, max_depth=None):
    """
    Secondary pass: walk 07_THEORIE and flag filenames (not full text) that
    contain a keyword but weren't already resolved via the bib search.
    Cheap and catches misfiled/unindexed PDFs; does not read PDF contents.
    """
    results = []
    root = Path(theorie_root)
    if not root.exists():
        print(f"  ! theorie root not found, skipping filename sweep: {root}", file=sys.stderr)
        return results

    already = set(already_matched_local_paths)
    file_count = 0
    for dirpath, dirnames, filenames in os.walk(root):
        for fname in filenames:
            if not fname.lower().endswith(".pdf"):
                continue
            file_count += 1
            full_path = str(Path(dirpath) / fname)
            if full_path in already:
                continue
            hits = match_text(fname, matchers)
            if hits:
                results.append({
                    "source": "filename_sweep",
                    "key": None,
                    "title": fname,
                    "author": "",
                    "year": "",
                    "matched_keywords": hits,
                    "matched_fields": {"filename": hits},
                    "file_paths_raw": [],
                    "file_paths_local": [full_path],
                    "file_exists": [True],
                })
    print(f"  swept {file_count} PDF filenames under {root}", file=sys.stderr)
    return results


def mark_already_in_project(results, project_pdf_dir):
    project_dir = Path(project_pdf_dir)
    existing_names = set()
    if project_dir.exists():
        existing_names = {p.name.lower() for p in project_dir.glob("*.pdf")}
    for r in results:
        names = {Path(p).name.lower() for p in r["file_paths_local"]}
        r["already_in_project_pdf_dir"] = bool(names & existing_names)
    return results


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", help="JSON config file with keys: bib_paths, theorie_root, project_pdf_dir, mount_map, keywords")
    ap.add_argument("--keywords", help="Comma-separated keyword list (overrides config/defaults)")
    ap.add_argument("--bib", action="append", help="Path to a .bib file (repeatable). Overrides config/defaults.")
    ap.add_argument("--theorie-root", help="Path to 07_THEORIE root. Overrides config/defaults.")
    ap.add_argument("--project-pdf-dir", help="Path to project's own pdf/ folder, for already-have marking.")
    ap.add_argument("--skip-filename-sweep", action="store_true", help="Skip the 07_THEORIE filename sweep (bib search only).")
    ap.add_argument("--out", required=True, help="Output JSON path")
    args = ap.parse_args()

    cfg = {}
    if args.config:
        cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))

    def expand(p):
        return os.path.expanduser(os.path.expandvars(p))

    bib_paths = [expand(p) for p in (args.bib or cfg.get("bib_paths", DEFAULT_BIB_PATHS))]
    theorie_root = expand(args.theorie_root or cfg.get("theorie_root", DEFAULT_THEORIE_ROOT))
    project_pdf_dir = expand(args.project_pdf_dir or cfg.get("project_pdf_dir", DEFAULT_PROJECT_PDF_DIR))
    mount_map = cfg.get("mount_map", {
        "C:/07_THEORIE": theorie_root,
        "C:/Project Files/08_Vergesellschaftung": str(Path(project_pdf_dir).parent),
    })
    if args.keywords:
        keywords = [k.strip() for k in args.keywords.split(",") if k.strip()]
    else:
        keywords = cfg.get("keywords", DEFAULT_KEYWORDS)

    matchers = build_keyword_matchers(keywords)

    print(f"Searching {len(bib_paths)} bib file(s) for {len(keywords)} keywords...", file=sys.stderr)
    bib_results = search_bib(bib_paths, matchers, mount_map)
    print(f"  -> {len(bib_results)} bib entries matched", file=sys.stderr)

    already_matched_paths = {p for r in bib_results for p in r["file_paths_local"]}

    sweep_results = []
    if not args.skip_filename_sweep:
        print(f"Sweeping {theorie_root} filenames for unresolved matches...", file=sys.stderr)
        sweep_results = sweep_filenames(theorie_root, matchers, already_matched_paths)
        print(f"  -> {len(sweep_results)} additional filename matches", file=sys.stderr)

    all_results = mark_already_in_project(bib_results + sweep_results, project_pdf_dir)

    # Sort: most keyword hits first, then bib entries before filename-only hits
    all_results.sort(key=lambda r: (-len(r["matched_keywords"]), r["source"] != "bib"))

    output = {
        "generated_by": "corpus_search.py",
        "keywords_used": keywords,
        "bib_paths": [str(p) for p in bib_paths],
        "theorie_root": theorie_root,
        "project_pdf_dir": project_pdf_dir,
        "counts": {
            "bib_matches": len(bib_results),
            "filename_sweep_matches": len(sweep_results),
            "total": len(all_results),
            "already_in_project_pdf_dir": sum(1 for r in all_results if r.get("already_in_project_pdf_dir")),
        },
        "results": all_results,
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(all_results)} results to {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()

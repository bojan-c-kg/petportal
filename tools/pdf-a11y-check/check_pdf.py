#!/usr/bin/env python3
import sys
from pathlib import Path
from typing import Callable

import pikepdf


def check_document_language(pdf: pikepdf.Pdf) -> tuple[bool, str]:
    lang = pdf.Root.get('/Lang')
    if lang is None:
        return False, 'no /Lang entry on document catalog'
    return True, f'/Lang={lang}'


def check_title_metadata(pdf: pikepdf.Pdf) -> tuple[bool, str]:
    info = pdf.docinfo
    if info is not None:
        info_title = info.get('/Title')
        if info_title:
            return True, f'/Info /Title={info_title}'
    with pdf.open_metadata() as meta:
        xmp_title = meta.get('dc:title')
        if xmp_title:
            return True, f'XMP dc:title={xmp_title}'
    return False, 'no Title in /Info dict or XMP metadata'


def check_structure_tree_root(pdf: pikepdf.Pdf) -> tuple[bool, str]:
    root = pdf.Root.get('/StructTreeRoot')
    if root is None:
        return False, 'no /StructTreeRoot (document is not tagged)'
    return True, '/StructTreeRoot present'


def check_images_have_alt_text(pdf: pikepdf.Pdf) -> tuple[bool, str]:
    missing: list[str] = []
    for page_number, page in enumerate(pdf.pages, start=1):
        resources = page.get('/Resources')
        if resources is None:
            continue
        xobjects = resources.get('/XObject')
        if xobjects is None:
            continue
        for name, xobj in xobjects.items():
            if xobj.get('/Subtype') == '/Image' and '/Alt' not in xobj:
                missing.append(f'page {page_number} {name}')
    if missing:
        return False, f'{len(missing)} image XObject(s) missing /Alt: {", ".join(missing)}'
    return True, 'no image XObjects, or all have /Alt'


CheckFn = Callable[[pikepdf.Pdf], tuple[bool, str]]

CHECKS: list[tuple[str, CheckFn]] = [
    ('document language', check_document_language),
    ('title metadata', check_title_metadata),
    ('structure tree root', check_structure_tree_root),
    ('image alt text', check_images_have_alt_text),
]


def run_checks(path: Path) -> int:
    pdf = pikepdf.open(path)
    failed = 0
    for label, check_fn in CHECKS:
        ok, detail = check_fn(pdf)
        status = 'PASS' if ok else 'FAIL'
        print(f'[{status}] {label}: {detail}')
        if not ok:
            failed += 1
    return 0 if failed == 0 else 1


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print('Usage: python check_pdf.py <pdf-path>', file=sys.stderr)
        return 2
    path = Path(argv[1])
    if not path.is_file():
        print(f'File not found: {path}', file=sys.stderr)
        return 2
    return run_checks(path)


if __name__ == '__main__':
    sys.exit(main(sys.argv))

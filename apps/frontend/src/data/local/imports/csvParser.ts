export type CsvRow = Record<string, string>;

export type ParsedCsv = {
  headers: string[];
  rows: CsvRow[];
};

function normalizeCell(value: string): string {
  return value.replace(/^\uFEFF/, '').trim();
}

function parseCells(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === ',' && !quoted) {
      row.push(normalizeCell(cell));
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(normalizeCell(cell));
      if (row.some(value => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(normalizeCell(cell));
  if (row.some(value => value.length > 0)) {
    rows.push(row);
  }

  return rows;
}

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseCsv(csv: string): ParsedCsv {
  const [headers = [], ...records] = parseCells(csv);
  const normalizedHeaders = headers.map(normalizeHeader);

  return {
    headers: normalizedHeaders,
    rows: records.map(record =>
      Object.fromEntries(
        normalizedHeaders.map((header, index) => [
          header,
          record[index]?.trim() ?? '',
        ]),
      ),
    ),
  };
}

export function getCsvValue(row: CsvRow, aliases: string[]): string {
  for (const alias of aliases.map(normalizeHeader)) {
    const value = row[alias];
    if (value) {
      return value;
    }
  }
  return '';
}

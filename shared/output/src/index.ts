import Table from 'cli-table3';
import { stringify } from 'csv-stringify/sync';

export type OutputFormat = 'json' | 'table' | 'csv';

export interface OutputOptions {
  format: OutputFormat;
  quiet?: boolean;
}

export interface ErrorPayload {
  code: string;
  message: string;
  retry_after?: number;
}

/**
 * Formats and prints data in the requested format.
 */
export function formatOutput(
  data: Record<string, unknown>[] | Record<string, unknown>,
  options: OutputOptions,
): string {
  const rows = Array.isArray(data) ? data : [data];

  switch (options.format) {
    case 'json':
      return JSON.stringify(Array.isArray(data) ? rows : data, null, 2);

    case 'table':
      return formatTable(rows);

    case 'csv':
      return formatCsv(rows);

    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * Prints formatted output to stdout.
 */
export function printOutput(
  data: Record<string, unknown>[] | Record<string, unknown>,
  options: OutputOptions,
): void {
  console.log(formatOutput(data, options));
}

/**
 * Formats an error for output.
 */
export function formatError(error: ErrorPayload, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify({ error }, null, 2);
  }
  let msg = `Error [${error.code}]: ${error.message}`;
  if (error.retry_after) {
    msg += `\nRetry after: ${error.retry_after}s`;
  }
  return msg;
}

/**
 * Prints an error to stderr.
 */
export function printError(error: ErrorPayload, format: OutputFormat): void {
  console.error(formatError(error, format));
}

function formatTable(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return 'No data';

  const keys = Object.keys(rows[0]);
  const table = new Table({
    head: keys,
    style: { head: ['cyan'] },
  });

  for (const row of rows) {
    table.push(keys.map((k) => String(row[k] ?? '')));
  }

  return table.toString();
}

function formatCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';

  const keys = Object.keys(rows[0]);
  return stringify(
    rows.map((row) => keys.map((k) => row[k])),
    { header: true, columns: keys },
  );
}

/**
 * Adds --output and --quiet options to a Commander command.
 */
export function addOutputOptions(command: { option: (flags: string, desc: string, defaultValue?: string) => unknown }) {
  command.option('-o, --output <format>', 'Output format (json, table, csv)', 'json');
  command.option('-q, --quiet', 'Suppress non-essential output');
  command.option('-v, --verbose', 'Enable verbose/debug output');
  return command;
}

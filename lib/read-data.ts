import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";

export type Responses = Array<Record<string, string>>;

export async function readAndParseCSV(filePath: string): Promise<Responses> {
    // Read the CSV file content
    const fileContent = await readFile(filePath, { encoding: "utf-8" });

    // Parse the CSV content
    // The `columns: true` option tells `csv-parse` to use the first row as headers
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    // Log the parsed objects or handle them as needed
    return records as Responses;
}

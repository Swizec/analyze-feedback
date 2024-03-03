import ollama from "ollama";
import { parseArgs } from "util";
import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";

async function readAndParseCSV(
    filePath: string
): Promise<Array<Record<string, string>>> {
    // Read the CSV file content
    const fileContent = await readFile(filePath, { encoding: "utf-8" });

    // Parse the CSV content
    // The `columns: true` option tells `csv-parse` to use the first row as headers
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    // Log the parsed objects or handle them as needed
    return records as Array<Record<string, string>>;
}

const { positionals } = parseArgs({
    args: Bun.argv,
    allowPositionals: true,
});

const filePath = positionals[positionals.length - 1];
if (!filePath.endsWith(".csv")) {
    throw new Error("You must provide the path to a CSV file");
}

console.log(`Analyzing ${filePath}`);

const data = await readAndParseCSV(filePath);
console.log(data);

// const response = await ollama.generate({
//     model: "llama2",
//     prompt: "Who are you?",
//     system: "You are a marketing assistant analyzing a reader feedback survey for a newsletter",
//     stream: true,
// });

// for await (const part of response) {
//     process.stdout.write(part.response);
// }

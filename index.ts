import ollama from "ollama";
import { parseArgs } from "util";
import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";

type Responses = Array<Record<string, string>>;
const systemPrompt =
    "You are a marketing assistant analyzing a reader feedback survey for a newsletter";

async function readAndParseCSV(filePath: string): Promise<Responses> {
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

async function whatHesitation(responses: Responses) {
    const question = "What hesitation did you have about subscribing?";
    const answers = responses
        .filter((r) => r[question].length > 0)
        .map(
            (r) => r[question]
            // `score: ${r["Are you enjoying Swizec’s Newsletter?"]}\nanswer: ${r[question]}`
        )
        .join("\n\n");

    const prompt = `We asked our readers "${question}". Here is a list of their answers. Summarize the answers into common themes and suggest improvements we can make.\n---\n${answers}`;

    console.log(prompt);

    const analysis = await ollama.generate({
        model: "llama2",
        prompt,
        system: systemPrompt,
        stream: true,
    });

    return analysis;
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

const hesitation = await whatHesitation(data);
for await (const part of hesitation) {
    process.stdout.write(part.response);
}

// const response = await ollama.generate({
//     model: "llama2",
//     prompt: "Who are you?",
//     system: "You are a marketing assistant analyzing a reader feedback survey for a newsletter",
//     stream: true,
// });

// for await (const part of response) {
//     process.stdout.write(part.response);
// }

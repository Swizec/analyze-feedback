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

async function analyzeQuestion(
    responses: Responses,
    question: string,
    explain: string
) {
    const answers = responses
        .filter((r) => r[question].length > 0)
        .map(
            (r) => r[question]
            // `score: ${r["Are you enjoying Swizec’s Newsletter?"]}\nanswer: ${r[question]}`
        )
        .join("\n\n");

    const prompt = `We asked our readers "${question}". Here is a list of their answers. Summarize the answers into common themes and explain ${explain}.\n---\n${answers}`;

    // console.log(prompt);

    const analysis = await ollama.generate({
        model: "llama2",
        prompt,
        system: systemPrompt,
        stream: true,
    });

    return analysis;
}

async function whatHesitation(responses: Responses) {
    return analyzeQuestion(
        responses,
        "What hesitation did you have about subscribing?",
        "what hesitations readers have before subscribing"
    );
}

async function whatLearned(responses: Responses) {
    return analyzeQuestion(
        responses,
        "What have you learned from Swizec’s Newsletter?",
        "what readers learned from the newsletter"
    );
}

async function whatLiked(responses: Responses) {
    return analyzeQuestion(
        responses,
        "What have you liked most about the Swizec’s Newsletter?",
        "what readers liked about the newsletter"
    );
}

async function whatBenefits(responses: Responses) {
    return analyzeQuestion(
        responses,
        "What are some other benefits you got from Swizec’s Newsletter?",
        "what benefits readers got from the newsletter"
    );
}

async function whyRecommend(responses: Responses) {
    return analyzeQuestion(
        responses,
        "Would you recommend Swizec’s Newsletter to a friend or coworker? Why?",
        "why readers would or wouldn't recommend the newsletter"
    );
}

async function whatOtherThoughts(responses: Responses) {
    return analyzeQuestion(
        responses,
        "Any other thoughts you'd like to share about Swizec’s Newsletter?",
        "how readers suggest we can improve"
    );
}

async function whatFor(responses: Responses) {
    return analyzeQuestion(
        responses,
        "What are you going to use this knowledge for?",
        "how readers intend to leverage the newsletter"
    );
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

const analysis = await whatBenefits(data);
for await (const part of analysis) {
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

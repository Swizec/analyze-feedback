import ollama from "ollama";
import { parseArgs } from "util";
import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";
import { differenceInSeconds } from "date-fns";

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
    explain: string,
    stream?: boolean
) {
    const answers = responses
        .filter((r) => r[question].length > 0)
        .map(
            (r) => r[question]
            // `score: ${r["Are you enjoying Swizec’s Newsletter?"]}\nanswer: ${r[question]}`
        )
        .join("\n\n");

    const prompt = `We asked our readers "${question}". Here is a list of their answers. Summarize the answers into 5 high level themes and explain ${explain}.\n---\n${answers}`;

    const analysis = await ollama.generate({
        model: "llama2",
        prompt,
        system: systemPrompt,
        // @ts-expect-error
        stream: !!stream,
    });

    return analysis;
}

async function whatHesitation(responses: Responses, stream?: boolean) {
    return analyzeQuestion(
        responses,
        "What hesitation did you have about subscribing?",
        "what hesitations readers have before subscribing",
        stream
    );
}

async function whatLearned(responses: Responses, stream?: boolean) {
    return analyzeQuestion(
        responses,
        "What have you learned from Swizec’s Newsletter?",
        "what readers learned from the newsletter",
        stream
    );
}

async function whatLiked(responses: Responses, stream?: boolean) {
    return analyzeQuestion(
        responses,
        "What have you liked most about the Swizec’s Newsletter?",
        "what readers liked about the newsletter",
        stream
    );
}

async function whatBenefits(responses: Responses, stream?: boolean) {
    return analyzeQuestion(
        responses,
        "What are some other benefits you got from Swizec’s Newsletter?",
        "what benefits readers got from the newsletter",
        stream
    );
}

async function whyRecommend(responses: Responses, stream?: boolean) {
    return analyzeQuestion(
        responses,
        "Would you recommend Swizec’s Newsletter to a friend or coworker? Why?",
        "why readers would or wouldn't recommend the newsletter",
        stream
    );
}

async function whatOtherThoughts(responses: Responses, stream?: boolean) {
    return analyzeQuestion(
        responses,
        "Any other thoughts you'd like to share about Swizec’s Newsletter?",
        "how readers suggest we can improve",
        stream
    );
}

async function whatFor(responses: Responses, stream?: boolean) {
    return analyzeQuestion(
        responses,
        "What are you going to use this knowledge for?",
        "how readers intend to leverage the newsletter",
        stream
    );
}

async function highLevelSummary(responses: Responses) {
    const questions = [
        {
            q: "What hesitation did you have about subscribing?",
            f: whatHesitation,
        },
        {
            q: "What have you learned from Swizec’s Newsletter?",
            f: whatLearned,
        },
        {
            q: "What have you liked most about the Swizec’s Newsletter?",
            f: whatLiked,
        },
        {
            q: "What are some other benefits you got from Swizec’s Newsletter?",
            f: whatBenefits,
        },
        {
            q: "Would you recommend Swizec’s Newsletter to a friend or coworker? Why?",
            f: whyRecommend,
        },
        {
            q: "Any other thoughts you'd like to share about Swizec’s Newsletter?",
            f: whatOtherThoughts,
        },
        { q: "What are you going to use this knowledge for?", f: whatFor },
    ];

    let prompt =
        "Swizec asked his readers a series of questions. Below is a high level summary of responses to each question. Write a short report on what readers think about the newsletters and what Swizec can improve.";

    for (const { q, f } of questions) {
        const summary = await f(responses);
        console.log(`\n\n## ${q}\n\n${summary.response}`);
        prompt += `\n\n## ${q}\n\n${summary.response}`;
    }

    return ollama.generate({
        model: "llama2",
        prompt,
        system: systemPrompt,
        stream: true,
    });
}

const { positionals } = parseArgs({
    args: Bun.argv,
    allowPositionals: true,
});

const filePath = positionals[positionals.length - 1];
if (!filePath.endsWith(".csv")) {
    throw new Error("You must provide the path to a CSV file");
}

console.log(`Analyzing ${filePath}. This might take a while`);

const data = await readAndParseCSV(filePath);

const t1 = new Date();
const analysis = await highLevelSummary(data);
console.log("\n\n--- analysis ---\n\n");
for await (const part of analysis) {
    process.stdout.write(part.response);
}

const t2 = new Date();
console.log(
    `\n\nAnalyis of ${data.length} responses took ${differenceInSeconds(
        t2,
        t1
    )} seconds.`
);

// const response = await ollama.generate({
//     model: "llama2",
//     prompt: "Who are you?",
//     system: "You are a marketing assistant analyzing a reader feedback survey for a newsletter",
//     stream: true,
// });

// for await (const part of response) {
//     process.stdout.write(part.response);
// }

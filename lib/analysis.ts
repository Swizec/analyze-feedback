import ollama from "ollama";
import type { Responses } from "./read-data";

const systemPrompt =
    "You are a marketing assistant analyzing a reader feedback survey for a newsletter";

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

export async function highLevelSummary(responses: Responses) {
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

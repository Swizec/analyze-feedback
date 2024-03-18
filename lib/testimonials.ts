import ollama from "ollama";
import type { Responses } from "./read-data";

const systemPrompt =
    "You are a marketing assistant analyzing a reader feedback survey for a newsletter";

const questions = [
    "What hesitation did you have about subscribing?",
    "What have you learned from Swizec’s Newsletter?",
    "What have you liked most about the Swizec’s Newsletter?",
    "What are some other benefits you got from Swizec’s Newsletter?",
    "Would you recommend Swizec’s Newsletter to a friend or coworker? Why?",
    "Any other thoughts you'd like to share about Swizec’s Newsletter?",
    "What are you going to use this knowledge for?",
];

export async function writeTestimonial(
    responses: Responses,
    answererIsA: "subscriber" | "reader" | "user"
) {
    const topResponses = responses
        .filter((r) => r["Are you enjoying Swizec’s Newsletter?"] === "5")
        .sort(
            (a, b) =>
                new Date(b["Submit Date (UTC)"]).getTime() -
                new Date(a["Submit Date (UTC)"]).getTime()
        );

    console.log(topResponses.length);

    const response = topResponses[0];
    const answers = questions.map((q) => ({ q, a: response[q] }));

    const prompt = `We asked a ${answererIsA} ${
        questions.length
    } questions about their experience. Turn these answers into a short testimonial. Keep the original phrasing. The testimonial should be short and to the point. It should start with a hesitation then highlight benefits that the ${answererIsA} experienced. Finish with why the ${answererIsA} would suggest this to others. Write a draft then make it shorter. Keep phrasing from the original answers.\n\nHere are the answers:\n\n${answers
        .map(({ q, a }) => `Question: ${q}\nAnswer: ${a}`)
        .join("\n\n")}`;

    console.log(prompt, "\n\n");

    return ollama.generate({
        model: "mistral",
        prompt,
        system: systemPrompt,
        stream: true,
    });
}

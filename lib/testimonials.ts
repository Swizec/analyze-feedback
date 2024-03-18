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

function concatResponse(response: Record<string, string>) {
    const answers = questions.map((q) => ({ q, a: response[q] }));
    return answers
        .map(({ q, a }) => `Question: ${q}\nAnswer: ${a}`)
        .join("\n\n");
}

export async function writeTestimonial(
    responses: Responses,
    answererIsA: "subscriber" | "reader" | "user"
) {
    const topResponses = responses
        .filter((r) => r["Are you enjoying Swizec’s Newsletter?"] === "5")
        .sort((a, b) => concatResponse(b).length - concatResponse(a).length);
    // .sort(
    //     (a, b) =>
    //         new Date(b["Submit Date (UTC)"]).getTime() -
    //         new Date(a["Submit Date (UTC)"]).getTime()
    // );

    console.log(topResponses.length);

    const response = topResponses[0];

    const prompt = `We asked a ${answererIsA} ${
        questions.length
    } questions about their experience. Turn these answers into a very short testimonial. Keep the original phrasing. The testimonial should be very short and to the point. It should start with a specific hesitation then highlight benefits that the ${answererIsA} experienced. Finish with why the ${answererIsA} would suggest this to others. Keep phrasing from the original answers. Write a draft then make it shorter.\n\nHere are the answers:\n\n${concatResponse(
        response
    )}`;

    console.log(prompt, "\n\n");

    return ollama.generate({
        model: "llama2",
        prompt,
        system: systemPrompt,
        stream: true,
    });
}

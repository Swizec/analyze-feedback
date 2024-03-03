import ollama from "ollama";

// async function askLLM(model: string, prompt: string, system: string) {
//     const res = await fetch("http://localhost:11434/api/generate", {
//         method: "POST",
//         body: JSON.stringify({
//             stream: false,
//             model,
//             prompt,
//             system,
//         }),
//     });

//     return res.json();
// }

// const res = await askLLM(
//     "llama2",
//     "Who are you?",
//     "You are a marketing assistant analyzing a reader feedback survey for a newsletter"
// );

const response = await ollama.generate({
    model: "llama2",
    prompt: "Who are you?",
    system: "You are a marketing assistant analyzing a reader feedback survey for a newsletter",
    stream: true,
});

for await (const part of response) {
    process.stdout.write(part.response);
}

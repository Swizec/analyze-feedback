import { parseArgs } from "util";

import { differenceInSeconds } from "date-fns";
import { readAndParseCSV } from "./lib/read-data";
import { highLevelSummary } from "./lib/analysis";
import { writeTestimonial } from "./lib/testimonials";

async function analyze(filePath: string) {
    console.log(`Analyzing ${filePath}. This might take a while`);

    const data = await readAndParseCSV(filePath);

    const analysis = await highLevelSummary(data);
    console.log("\n\n--- analysis ---\n\n");
    for await (const part of analysis) {
        process.stdout.write(part.response);
    }
}

async function testimonials(filePath: string) {
    console.log(
        `Extracting testimonials from ${filePath}. This might take a while`
    );

    const data = await readAndParseCSV(filePath);

    const testimonial = await writeTestimonial(data, "subscriber");
    // console.log(testimonial);

    for await (const part of testimonial) {
        process.stdout.write(part.response);
    }
}

const { positionals } = parseArgs({
    args: Bun.argv,
    allowPositionals: true,
});

const task = positionals[positionals.length - 2];

if (!["analyze", "testimonials"].includes(task)) {
    throw new Error(
        "You must choose a task – analyze or testimonials. Like this:\n\nbun index.ts analyze responses.csv\nbun index.ts testimonials responses.csv"
    );
}

const filePath = positionals[positionals.length - 1];
if (!filePath.endsWith(".csv")) {
    throw new Error("You must provide the path to a CSV file");
}

const t1 = new Date();

console.log(task);

switch (task) {
    case "analyze":
        await analyze(filePath);
        break;
    case "testimonials":
        await testimonials(filePath);
        break;
}

const t2 = new Date();
console.log(
    `\n\nAnalyis of responses took ${differenceInSeconds(t2, t1)} seconds.`
);

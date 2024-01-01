const Replicate = require("replicate");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const sanitize = require("sanitize-filename");
const { program } = require("commander");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

program
  .option("-f, --file <type>", "Input file with prompts")
  .option(
    "-o, --output <type>",
    "Output folder for the generated files",
    "output",
  )
  .option(
    "--voice <type>",
    "Voice ID or characteristics for the audio generation",
    "1088",
  )
  .option(
    "-l, --language <type>",
    "Language of the speech, e.g., English, Chinese",
    "Chinese",
  )
  .option("-e, --emotion <type>", "Emotional prompt in Mandarin", "高兴");

program.parse(process.argv);

const options = program.opts();

function getSafeFilename(prompt) {
  return sanitize(prompt).slice(0, 30);
}

async function runModel(prompt, outputFolder, voice, language, emotion) {
  try {
    console.log("Prompt: ", prompt);
    const output = await replicate.run(
      "bramhooimeijer/emotivoice:261b541053a0a30d922fd61bb47fbbc669941cb84f96a8f0042f14e8ad34f494",
      {
        input: {
          prompt: emotion,
          language: language,
          speaker: voice,
          content: prompt,
        },
      },
    );

    if (typeof output === "string" && output.startsWith("https://")) {
      const response = await axios({
        url: output,
        responseType: "arraybuffer",
      });
      const data = response.data;
      const timestamp = moment().format("YYYY-MM-DDTHH_mm_ss_SSS");
      const safePrompt = getSafeFilename(prompt);
      const filename = `${timestamp}_${safePrompt}.mp3`;
      const outputPath = path.join(outputFolder, filename);
      fs.writeFileSync(outputPath, data);
      console.log(`Output saved to ${outputPath}`);
    } else {
      throw new Error("Invalid URL received from API call.");
    }
  } catch (error) {
    console.error("Error running model:", error);
  }
}

function processFile(filePath, outputFolder, voice, language, emotion) {
  const lines = fs.readFileSync(filePath, { encoding: "utf8" }).split("\n");
  lines.forEach((line) => {
    if (line.trim()) {
      runModel(line.trim(), outputFolder, voice, language, emotion);
    }
  });
}

const input = options.file;
const outputFolder = options.output;
const voice = options.voice;
const language = options.language;
const emotion = options.emotion;

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

if (input) {
  if (fs.existsSync(input) && fs.statSync(input).isFile()) {
    processFile(input, outputFolder, voice, language, emotion);
  } else {
    console.error("Invalid input file.");
    process.exit(1);
  }
} else if (program.args.length > 0) {
  const prompt = program.args.join(" ");
  runModel(prompt, outputFolder, voice, language, emotion);
} else {
  console.error("No input provided.");
  process.exit(1);
}

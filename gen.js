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

function padIndex(index, length) {
  return String(index).padStart(length, '0');
}

async function runModel(prompt, outputFolder, voice, language, emotion, paddedIndex) {
  try {
    console.log("Prompt: ", prompt);
    // Check if the voices is in voices.json, which has a list of voices in the voices key
    // If the voice is not in the list, then exit
    if (fs.existsSync("voices.json")) {
      const voices = JSON.parse(fs.readFileSync("voices.json", "utf8"));
      if (!voices.voices.includes(voice)) {
        console.log(`Voice ID ${voice} not found in voices.json`);
        process.exit(1);
      }
    }
    
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
      const currentDate = moment().format("YYYY-MM-DD");
      const response = await axios({
        url: output,
        responseType: "arraybuffer",
      });
      const data = response.data;
      const safePrompt = getSafeFilename(prompt);
      const filename = `${currentDate}_${paddedIndex}_${voice}_${safePrompt}.mp3`;
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

async function processFile(filePath, outputFolder, voice, language, emotion) {
  const lines = fs.readFileSync(filePath, { encoding: "utf8" }).split("\n");
  const padLength = String(lines.length).length;

  lines.forEach((line, index) => {
    if (line.trim()) {
      const paddedIndex = padIndex(index, padLength);
      runModel(line.trim(), outputFolder, voice, language, emotion, paddedIndex);
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
  runModel(prompt, outputFolder, voice, language, emotion, 0);
} else {
  console.error("No input provided.");
  process.exit(1);
}

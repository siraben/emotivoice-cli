# Emotivoice CLI

<p align="center"><img src="./logo.png" width=350></p>

## Description
This is a CLI tool that uses the [Emotivoice
API](https://github.com/netease-youdao/EmotiVoice) to convert text to
speech with ability for emotional synthesis. It supports multiple
languages, with a default setting for Mandarin Chinese, and allows
users to customize the emotional tone of the speech using Chinese
prompts.

## Features
- Supports multiple languages, defaulting to Mandarin Chinese.
- Customizable emotional tone using Chinese prompts.
- Processes text input directly or from a file.
- Outputs in MP3 format with customizable voice and language options.

### Example
To convert a Chinese sentence into speech with a happy tone, run

```sh
node gen.js "春节是中国最重要的佳节之一。" --language Chinese --emotion 高兴
```

The output is given in the `output` folder, with the timestamped and
prefixed mp3 output.

## Installation
1. **Clone the Repository**
```ShellSession
$ git clone [repository-url]
$ cd [repository-directory]
```

2. **Install Dependencies**
   Ensure Node.js and npm are installed, then run:
```ShellSession
$ npm install
```

## Usage
To use the tool, execute the following command:

- **Direct Text Input:**
```ShellSession
node gen.js "Your text here" [--output <output_folder>] [--voice <voice_id>] [--language <language>] [--emotion <chinese_emotion>]
  ```

- **File Input:**
```ShellSession
node gen.js -f <path_to_file> [--output <output_folder>] [--voice <voice_id>] [--language <language>] [--emotion <chinese_emotion>]
  ```

Options:
- `-e, --emotion <chinese_emotion>`: Optional. Specify the emotional tone using a Chinese prompt. Defaults to '高兴' (happy).

### Example Emotions
- '高兴' (Gāoxìng) - Happy
- '悲伤' (Bēishāng) - Sad
- '愤怒' (Fènnù) - Angry
- '兴奋' (Xīngfèn) - Excited
- '平静' (Píngjìng) - Calm

## Configuration
Set `REPLICATE_API_TOKEN` in your environment variables for authentication with the Emotivoice API.

## Contributing
Contributions are welcome. Please fork the repository, make your changes, and submit a pull request.

## License
This project is licensed under the MIT License.

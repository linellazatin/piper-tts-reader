# piper-reader

Read any text or markdown file aloud using [piper-tts](https://github.com/OHF-voice/piper1-gpl) -- a fast, local, offline text-to-speech engine. Available as a VSCodium/VS Code extension and a standalone CLI script.

## Features

- Reads plain text and markdown files aloud via piper-tts
- Strips markdown syntax before speaking (no asterisks, hashes, or bracket noise)
- Paragraph-by-paragraph generation with progress display
- Pitch-preserving speed control via sox tempo
- Save output to WAV file
- Download voice models directly from Hugging Face
- VSCodium/VS Code extension with tab context menu integration

---

## VSCodium / VS Code Extension

### Installation

Install from VSIX:

```bash
codium --install-extension piper-reader-0.0.1.vsix
```

Or via the UI: Extensions panel -> `...` -> "Install from VSIX..."

### Requirements

- `piper-tts` -- `pip install piper-tts`
- `sox` -- `sudo dnf install sox` / `brew install sox`
- At least one piper voice model (`.onnx` + `.onnx.json`)

### Setup

Open **Settings** (`Ctrl+,`) and search for `Piper Reader`. Set at minimum:

| Setting | Description |
|---|---|
| `piperReader.voicesDir` | **Required.** Path to your voice models directory (e.g. `/home/user/voices`) |
| `piperReader.model` | Voice model bare name (e.g. `en_US-amy-medium`) or full path |

### Usage

Right-click any open editor tab:

| Command | Action |
|---|---|
| **Piper Read** | Read the file aloud immediately |
| **Piper Save** | Render to WAV -- opens a save dialog |
| **Piper Stop** | Stop current playback |

Click the status bar item (shown while reading) to stop playback at any time.

### All Settings

| Setting | Default | Description |
|---|---|---|
| `piperReader.voicesDir` | _(empty)_ | Directory containing voice model `.onnx` files |
| `piperReader.model` | `en_US-amy-medium` | Voice model name or full path |
| `piperReader.lengthScale` | `1.0` | Phoneme length / speed (higher = slower) |
| `piperReader.noiseScale` | `0.9` | Expressiveness / variation |
| `piperReader.noiseW` | `0.85` | Phoneme width noise |
| `piperReader.sentenceSilence` | `0.4` | Seconds of silence after each sentence |
| `piperReader.volume` | `0.75` | Volume multiplier |
| `piperReader.tempo` | `1.1` | Pitch-preserving speed (1.0=normal, 0.9=10% slower) |
| `piperReader.soxGain` | `-1` | Sox gain in dB to prevent clipping |
| `piperReader.speaker` | _(empty)_ | Speaker ID for multi-speaker models |

---

## CLI Usage

### Requirements

| Dependency | Install |
|---|---|
| `piper-tts` | `pip install piper-tts` |
| `sox` | `sudo dnf install sox` / `brew install sox` |
| `curl` | Usually pre-installed |

### Install

```bash
git clone https://github.com/linellazatin/piper-tts-reader.git
cd piper-tts-reader
chmod +x piper-reader
```

Optionally symlink to PATH:

```bash
ln -s "$PWD/piper-reader" ~/.local/bin/piper-reader
```

### Configuration

`VOICES_DIR` has no baked-in default. You **must** set it before using `--list`, `--download`, or reading any file, or you will get an error. Do this in one of three ways:

**Option A -- conf file beside the script (recommended for CLI use):**

```bash
# piper-reader.conf
MODEL=en_US-amy-medium
VOICES_DIR=/path/to/your/voices
```

**Option B -- env var pointing to any config file:**

```bash
export PIPER_READER_CONFIG=/path/to/my-piper.conf
```

**Option C -- CLI flag per invocation:**

```bash
./piper-reader --voices-dir /path/to/your/voices notes.md
```

Full config reference:

```bash
MODEL=en_US-amy-medium
VOICES_DIR=/path/to/voices
LENGTH_SCALE=1.0
NOISE_SCALE=0.9
NOISE_W_SCALE=0.85
SENTENCE_SILENCE=0.4
VOLUME=0.75
SOX_GAIN=-1
TEMPO=1.1
SAMPLE_RATE=22050
```

Config resolution order:
1. `PIPER_READER_CONFIG` env var (if set, path to a config file)
2. `piper-reader.conf` beside the script (if present)
3. Baked-in defaults (no `VOICES_DIR` -- must be set explicitly)

All values can be overridden per-invocation via CLI flags.

### Examples

```bash
# Read a file aloud
./piper-reader notes.md

# Read from stdin
echo "Hello world" | ./piper-reader
cat article.txt | ./piper-reader

# Tune voice on the fly
./piper-reader --noise-scale 0.9 --tempo 0.95 notes.md

# Save to WAV instead of playing
./piper-reader --output speech.wav notes.md

# Use a specific model
./piper-reader --model en_US-lessac-high notes.md

# Multi-speaker model
./piper-reader --model en_US-libritts-high --speaker 5 notes.md

# List downloaded models
./piper-reader --list

# Download a model
./piper-reader --download en_US-amy-medium
```

### Flag Reference

| Flag | Description |
|---|---|
| `-m`, `--model MODEL` | Model path or bare name (resolved against `VOICES_DIR`) |
| `--voices-dir DIR` | Directory containing voice models |
| `-l`, `--length-scale N` | Phoneme length / speed (higher = slower) |
| `-n`, `--noise-scale N` | Generator noise / expressiveness |
| `-w`, `--noise-w N` | Phoneme width noise |
| `-s`, `--speaker ID` | Speaker ID for multi-speaker models |
| `--sentence-silence N` | Seconds of silence after each sentence |
| `--volume N` | Volume multiplier |
| `--tempo N` | Pitch-preserving speed (1.0=normal, 0.9=10% slower) |
| `--sox-gain N` | Sox gain in dB to prevent clipping |
| `--no-normalize` | Disable piper audio normalization |
| `-o`, `--output FILE.wav` | Save to WAV instead of playing |
| `--download NAME` | Download model from [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices) |
| `--list` | List available models in `VOICES_DIR` |
| `--debug` | Enable piper debug output |
| `-h`, `--help` | Show help |

### Markdown Stripping

The following is stripped before text reaches piper:

- Fenced code blocks
- Inline code backticks (content kept)
- Headers
- Bold (`**text**`, `__text__`)
- Images (removed entirely)
- Links (link text kept)
- HTML tags
- Horizontal rules

---

## Voice Models

Browse and audition voices at [rhasspy.github.io/piper-samples](https://rhasspy.github.io/piper-samples/).

Download via CLI (requires `VOICES_DIR` to be set in your config, or pass `--voices-dir`):

```bash
./piper-reader --download en_US-amy-medium
./piper-reader --download en_US-ryan-high

# or without a config file:
./piper-reader --voices-dir ~/voices --download en_US-amy-medium
```

Or browse the full list at [huggingface.co/rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices).

---

## License

MIT

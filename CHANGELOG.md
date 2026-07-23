# Changelog

All notable changes to this project will be documented in this file.

## [0.0.2] - 2026-07-23

### Changed
- Removed `~/.config/piper-reader/` (XDG-compliant removal for compatibility) config fallback -- config resolution is now: `PIPER_READER_CONFIG` env var > `piper-reader.conf` beside script > baked-in defaults
- Fixed variables clean-up

### Added
- `CHANGELOG.md`

## [0.0.1] - 2026-07-23

 - Initial release

### Added
- `piper-reader` bash script for reading text and markdown files aloud via piper-tts
- VSCodium/VS Code extension with tab context menu (Piper Read, Piper Save, Piper Stop)
- Markdown stripping (headers, bold, images, links, code blocks, HTML)
- Paragraph-by-paragraph generation with progress counter
- Pitch-preserving speed control via sox `tempo` effect
- Sox gain control to prevent clipping
- Save output to WAV file (`--output`)
- Download voice models from Hugging Face (`--download`)
- List available voice models (`--list`)
- Multi-speaker model support (`--speaker`)
- Config file support (`piper-reader.conf` beside script if independently triggered)
- Status bar item during playback (click to stop)
- All voice tuning settings exposed in extension settings
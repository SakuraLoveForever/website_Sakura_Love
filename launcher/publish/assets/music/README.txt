Put role music files in per-character folders.

Folder structure:

assets/music/02/
assets/music/chitanda/
assets/music/kaguya/
assets/music/yachiyo/
assets/music/iroha/
assets/music/eriyi/
assets/music/elaina/
assets/music/chtholly/
assets/music/sora/
assets/music/akame/
assets/music/mine/
assets/music/esdeath/
assets/music/krul/
assets/music/shinoa/
assets/music/violet/
assets/music/toki/

Inside each folder, name tracks like:
1.mp3
2.mp3
3.mp3
...

Playback:
- The website plays tracks in a shuffled loop (no repeat within one round).
- Next track starts automatically when the current track ends.

Important:
- Update track counts in script.js -> characterMusicTrackCount.
- Refresh the page and keep the "音乐" toggle enabled.

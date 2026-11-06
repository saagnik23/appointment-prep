const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, 'assets');
const outputMp4 = path.join(__dirname, 'AppointmentPrep_Teaser_45s.mp4');

console.log('--- Re-Assembling Precise 45-Second Product Launch Teaser ---');

// Durations totaling exactly 45.0s:
// 6.5 + 7.0 + 12.5 + 11.0 + 8.0 = 45.0s
const beats = [
  { id: 1, duration: 6.5, slide: 'slide1.png', vo: 'vo_beat1.aiff' },
  { id: 2, duration: 7.0, slide: 'slide2.png', vo: 'vo_beat2.aiff' },
  { id: 3, duration: 12.5, slide: 'slide3.png', vo: 'vo_beat3.aiff' },
  { id: 4, duration: 11.0, slide: 'slide4.png', vo: 'vo_beat4.aiff' },
  { id: 5, duration: 8.0, slide: 'slide5.png', vo: 'vo_beat5.aiff' },
];

const clipFiles = [];
for (const b of beats) {
  const clipPath = path.join(dir, `clip_beat${b.id}.mp4`);
  clipFiles.push(clipPath);

  const slidePath = path.join(dir, b.slide);
  const voPath = path.join(dir, b.vo);
  const totalFrames = Math.round(b.duration * 30);

  console.log(`Rendering Beat ${b.id} (${b.duration}s, ${totalFrames} frames)...`);

  // We explicitly specify:
  // -frames:v ${totalFrames} and -t ${b.duration} to guarantee exact timing
  const cmd = `ffmpeg -y -loop 1 -i "${slidePath}" -i "${voPath}" \
    -filter_complex "[0:v]scale=1920:1080,zoompan=z='min(zoom+0.0003,1.04)':d=${totalFrames}:s=1920x1080:fps=30[v];[1:a]apad=whole_dur=${b.duration},volume=1.2[a]" \
    -map "[v]" -map "[a]" \
    -c:v libx264 -pix_fmt yuv420p -r 30 -preset ultrafast -crf 20 \
    -c:a aac -b:a 192k \
    -t ${b.duration} -frames:v ${totalFrames} \
    "${clipPath}"`;

  execSync(cmd, { stdio: 'inherit' });
}

// Step 2: Concat the 5 clips
console.log('Concatenating clips...');
const concatList = path.join(dir, 'concat_list.txt');
fs.writeFileSync(
  concatList,
  clipFiles.map(f => `file '${f}'`).join('\n')
);

// Final concat with ffmpeg
const finalCmd = `ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:v copy -c:a copy "${outputMp4}"`;
execSync(finalCmd, { stdio: 'inherit' });

console.log(`\n🎉 Success! Teaser MP4 created at:\n${outputMp4}`);

// Check file stats
const stats = fs.statSync(outputMp4);
console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

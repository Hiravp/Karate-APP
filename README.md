# Karate-APP

Goju Karate Kata Motion Coach is a browser app prototype that uses a camera as a
motion sensor, estimates movement from video frames in the browser, and gives
kata-specific correction cues with a 3D body model.

## Features

- Goju kata selector with reference notes for Sanchin, Gekisai Dai Ichi, Saifa,
  and Seiyunchin.
- Camera-based motion sensing using `getUserMedia` and canvas frame analysis.
- Kata-specific scoring for motion, stance stability, guard height, and AI
  confidence.
- 3D correction model that changes stance width, guard height, hip rotation, and
  shoulder rotation based on the selected kata and detected motion.
- Private by design: video is processed locally in the browser and is not sent
  to a server.

## Run locally

```bash
npm start
```

Open `http://localhost:4173` in Chrome, Edge, Safari, or Firefox. Camera access requires localhost or HTTPS; if you double-click `index.html` from your files, the demo mode will load but most browsers will block live camera access. If camera access is blocked, the app keeps running with demo motion data and shows a message in the preview.

## Test

```bash
npm test
```

## Notes for future AI pose integration

The current implementation uses lightweight frame-difference motion analysis so
the prototype works without external services or model downloads. The
`src/analysisEngine.js` module is intentionally isolated so a production pose
model, such as MediaPipe Pose, MoveNet, or a custom Goju kata classifier, can
replace the sample generation while keeping the kata correction UI unchanged.

export const kataLibrary = [
  {
    id: "sanchin",
    name: "Sanchin",
    meaning: "Three battles",
    stance: "Sanchin dachi",
    tempo: "Slow, rooted, breath-led",
    targetMotion: 0.32,
    targetStability: 0.88,
    model: {
      stanceWidth: 0.38,
      hipRotation: -6,
      shoulderRotation: 6,
      guardHeight: 0.74,
      forwardPressure: 0.45
    },
    checkpoints: [
      "Keep knees pressed inward with the pelvis tucked.",
      "Drive punches from the lats while keeping elbows close.",
      "Coordinate ibuki breathing with every step and strike."
    ],
    corrections: [
      {
        metric: "stability",
        threshold: 0.78,
        priority: "Rooting",
        title: "Lower your center and lock the stance.",
        detail:
          "Sanchin needs quiet hips and steady foot pressure. Bend the knees, tuck the pelvis, and reduce upper-body sway."
      },
      {
        metric: "motion",
        threshold: 0.52,
        priority: "Tempo",
        title: "Slow the movement and show tension.",
        detail:
          "Your motion is too large for Sanchin. Compress the step, keep elbows connected, and let breath set the pace."
      },
      {
        metric: "guard",
        threshold: 0.66,
        priority: "Guard",
        title: "Raise the guard to the solar plexus line.",
        detail:
          "The model is showing the hands drifting low. Keep forearms in front of the ribs and fists on center."
      }
    ]
  },
  {
    id: "gekisai-dai-ichi",
    name: "Gekisai Dai Ichi",
    meaning: "Attack and smash number one",
    stance: "Zenkutsu dachi and shiko dachi transitions",
    tempo: "Sharp blocks, committed stepping",
    targetMotion: 0.62,
    targetStability: 0.7,
    model: {
      stanceWidth: 0.56,
      hipRotation: 16,
      shoulderRotation: -12,
      guardHeight: 0.68,
      forwardPressure: 0.7
    },
    checkpoints: [
      "Snap gedan barai and jodan uke to a clear stop.",
      "Use hip rotation before the reverse punch lands.",
      "Settle into shiko dachi before the elbow and backfist."
    ],
    corrections: [
      {
        metric: "motion",
        threshold: 0.46,
        priority: "Power",
        title: "Commit more body mass into the line.",
        detail:
          "This kata should read as decisive. Step through the floor, rotate the hips, and finish each block sharply."
      },
      {
        metric: "stability",
        threshold: 0.58,
        priority: "Balance",
        title: "Stabilize before changing direction.",
        detail:
          "The motion trace is wobbling during turns. Land the foot, align knee over toes, then fire the next technique."
      },
      {
        metric: "guard",
        threshold: 0.6,
        priority: "Chamber",
        title: "Return the non-striking hand to chamber.",
        detail:
          "Keep hikite active. Pull the opposite fist to the ribs so the model can show a stronger shoulder line."
      }
    ]
  },
  {
    id: "saifa",
    name: "Saifa",
    meaning: "Smash and tear",
    stance: "Neko ashi dachi, zenkutsu dachi, and close-range turns",
    tempo: "Whip-like acceleration",
    targetMotion: 0.72,
    targetStability: 0.64,
    model: {
      stanceWidth: 0.48,
      hipRotation: -22,
      shoulderRotation: 24,
      guardHeight: 0.62,
      forwardPressure: 0.58
    },
    checkpoints: [
      "Keep the cat stance light before the explosive release.",
      "Use tearing hands with shoulder rotation, not arm strength alone.",
      "Make the close-range strikes compact and sudden."
    ],
    corrections: [
      {
        metric: "motion",
        threshold: 0.56,
        priority: "Explosiveness",
        title: "Add a sharper acceleration phase.",
        detail:
          "Saifa needs contrast. Stay relaxed in the setup, then whip the torso and hands together at the finish."
      },
      {
        metric: "stability",
        threshold: 0.5,
        priority: "Footwork",
        title: "Control the cat stance before releasing.",
        detail:
          "The model detected unstable weight transfer. Keep the rear leg loaded and place the front foot lightly."
      },
      {
        metric: "guard",
        threshold: 0.58,
        priority: "Structure",
        title: "Keep elbows connected during tearing motions.",
        detail:
          "Avoid reaching with the hands. Rotate the torso and keep the elbows heavy so the technique stays close-range."
      }
    ]
  },
  {
    id: "seiyunchin",
    name: "Seiyunchin",
    meaning: "Control, pull, and fight",
    stance: "Deep shiko dachi",
    tempo: "Heavy, grounded, pulling power",
    targetMotion: 0.44,
    targetStability: 0.82,
    model: {
      stanceWidth: 0.72,
      hipRotation: 8,
      shoulderRotation: -8,
      guardHeight: 0.58,
      forwardPressure: 0.38
    },
    checkpoints: [
      "Sink evenly into shiko dachi without leaning forward.",
      "Pull with the back and hips before the hands finish.",
      "Keep the spine tall through slow tension sequences."
    ],
    corrections: [
      {
        metric: "stability",
        threshold: 0.72,
        priority: "Depth",
        title: "Sink into shiko dachi and level the hips.",
        detail:
          "Seiyunchin depends on a low, even base. Widen the feet, open the knees, and keep the spine stacked."
      },
      {
        metric: "motion",
        threshold: 0.6,
        priority: "Control",
        title: "Reduce bouncing between techniques.",
        detail:
          "Keep the head height steady. Pull from the waist and finish without popping up out of the stance."
      },
      {
        metric: "guard",
        threshold: 0.55,
        priority: "Pulling line",
        title: "Finish pulls on the centerline.",
        detail:
          "The reference model is showing the hands moving outside the body. Draw elbows back along the ribs."
      }
    ]
  }
];

export function getKataById(id) {
  return kataLibrary.find((kata) => kata.id === id) ?? kataLibrary[0];
}

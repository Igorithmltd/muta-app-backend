const dietPlan = [
    {
      "title": "Balanced Healthy Plan",
      "description": "A balanced diet with all macronutrients, perfect for general health.",
      "category": "64f32a1eabc1234567890abc",
      "calories": 2000,
      "tags": ["balanced", "health", "general"],
      "duration": 3,
      "dailyMealBreakdown": [
        {
          "dayLabel": "Day 1",
          "meals": [
            {
              "mealTitle": "Oatmeal with nuts",
              "mealType": "breakfast",
              "crabs": 50,
              "protein": 10,
              "fats": 10,
              "calories": 350,
              "recommendedTime": "07:30:00",
              "missedBy": "09:30:00"
            },
            {
              "mealTitle": "Chicken Salad",
              "mealType": "lunch",
              "crabs": 30,
              "protein": 40,
              "fats": 15,
              "calories": 450,
              "recommendedTime": "12:30:00",
              "missedBy": "14:00:00"
            }
          ]
        },
        {
          "dayLabel": "Day 2",
          "meals": [
            {
              "mealTitle": "Scrambled eggs and toast",
              "mealType": "breakfast",
              "crabs": 25,
              "protein": 20,
              "fats": 15,
              "calories": 320,
              "recommendedTime": "08:00:00",
              "missedBy": "10:00:00"
            },
            {
              "mealTitle": "Grilled salmon",
              "mealType": "dinner",
              "crabs": 20,
              "protein": 50,
              "fats": 20,
              "calories": 500,
              "recommendedTime": "18:00:00",
              "missedBy": "20:00:00"
            }
          ]
        },
        {
          "dayLabel": "Day 3",
          "meals": [
            {
              "mealTitle": "Fruit smoothie",
              "mealType": "snack",
              "crabs": 40,
              "protein": 5,
              "fats": 2,
              "calories": 220,
              "recommendedTime": "10:00:00",
              "missedBy": "11:30:00"
            },
            {
              "mealTitle": "Beef stir-fry",
              "mealType": "dinner",
              "crabs": 30,
              "protein": 45,
              "fats": 18,
              "calories": 550,
              "recommendedTime": "19:00:00",
              "missedBy": "21:00:00"
            }
          ]
        }
      ],
      "image": {
        "imageUrl": "https://example.com/images/balanced-plan.jpg",
        "publicId": "balanced-plan-001"
      }
    },
    {
      "title": "Low Carb Plan",
      "description": "A low carbohydrate diet for weight loss.",
      "category": "64f32a1eabc1234567890def",
      "calories": 1800,
      "tags": ["lowcarb", "weightloss"],
      "duration": 2,
      "dailyMealBreakdown": [
        {
          "dayLabel": "Day 1",
          "meals": [
            {
              "mealTitle": "Avocado and eggs",
              "mealType": "breakfast",
              "crabs": 10,
              "protein": 25,
              "fats": 30,
              "calories": 400,
              "recommendedTime": "08:00:00",
              "missedBy": "10:00:00"
            },
            {
              "mealTitle": "Steak with veggies",
              "mealType": "dinner",
              "crabs": 15,
              "protein": 60,
              "fats": 25,
              "calories": 600,
              "recommendedTime": "19:00:00",
              "missedBy": "21:00:00"
            }
          ]
        },
        {
          "dayLabel": "Day 2",
          "meals": [
            {
              "mealTitle": "Greek yogurt with seeds",
              "mealType": "snack",
              "crabs": 12,
              "protein": 15,
              "fats": 10,
              "calories": 220,
              "recommendedTime": "10:30:00",
              "missedBy": "12:00:00"
            }
          ]
        }
      ],
      "image": {
        "imageUrl": "https://example.com/images/low-carb.jpg",
        "publicId": "low-carb-002"
      }
    },
    {
      "title": "Vegan Detox Plan",
      "description": "A plant-based detox for cleansing and energy.",
      "category": "64f32a1eabc1234567890aaa",
      "calories": 1500,
      "tags": ["vegan", "detox", "plantbased"],
      "duration": 4,
      "dailyMealBreakdown": [
        {
          "dayLabel": "Day 1",
          "meals": [
            {
              "mealTitle": "Green smoothie",
              "mealType": "breakfast",
              "crabs": 40,
              "protein": 5,
              "fats": 3,
              "calories": 250,
              "recommendedTime": "07:00:00",
              "missedBy": "09:00:00"
            },
            {
              "mealTitle": "Quinoa salad",
              "mealType": "lunch",
              "crabs": 50,
              "protein": 15,
              "fats": 10,
              "calories": 400,
              "recommendedTime": "13:00:00",
              "missedBy": "15:00:00"
            }
          ]
        },
        {
          "dayLabel": "Day 2",
          "meals": [
            {
              "mealTitle": "Chickpea hummus wrap",
              "mealType": "lunch",
              "crabs": 45,
              "protein": 12,
              "fats": 15,
              "calories": 420,
              "recommendedTime": "12:30:00",
              "missedBy": "14:00:00"
            },
            {
              "mealTitle": "Roasted veggies",
              "mealType": "dinner",
              "crabs": 35,
              "protein": 8,
              "fats": 12,
              "calories": 380,
              "recommendedTime": "19:00:00",
              "missedBy": "20:30:00"
            }
          ]
        },
        {
          "dayLabel": "Day 3",
          "meals": [
            {
              "mealTitle": "Berry bowl",
              "mealType": "breakfast",
              "crabs": 30,
              "protein": 5,
              "fats": 2,
              "calories": 200,
              "recommendedTime": "08:00:00",
              "missedBy": "09:30:00"
            }
          ]
        },
        {
          "dayLabel": "Day 4",
          "meals": [
            {
              "mealTitle": "Lentil soup",
              "mealType": "dinner",
              "crabs": 40,
              "protein": 20,
              "fats": 10,
              "calories": 350,
              "recommendedTime": "18:30:00",
              "missedBy": "20:00:00"
            }
          ]
        }
      ],
      "image": {
        "imageUrl": "https://example.com/images/vegan-detox.jpg",
        "publicId": "vegan-detox-003"
      }
    }
]

const workoutplan = [
  {
    "title": "Beginner Full Body Blast",
    "description": "A 2-day beginner workout plan targeting all major muscle groups.",
    "duration": 45,
    "category": "60f8c0f4e3a2f72b94a10c4d",
    "calories": 350,
    "level": "begineer",
    "recommended": "YES",
    "roundsCount": 4,
    "planRounds": [
      {
        "dayLabel": "Day 1",
        "dayDate": "2025-08-05",
        "rounds": [
          {
            "title": "Bodyweight Squats",
            "duration": 60,
            "set": 3,
            "reps": 15,
            "restBetweenSet": 30,
            "instruction": "Keep knees behind toes and chest up.",
            "animation": "bodyweight-squats.gif",
            "commonMistakesToAvoid": ["Knees forward", "Leaning too far"],
            "breathingTips": ["Inhale down", "Exhale up"],
            "focusArea": ["Legs", "Glutes"],
            "status": "in-progress"
          },
          {
            "title": "Wall Push-ups",
            "duration": 45,
            "set": 3,
            "reps": 12,
            "restBetweenSet": 30,
            "instruction": "Keep body straight, push from wall.",
            "animation": "wall-push-ups.gif",
            "commonMistakesToAvoid": ["Sagging hips", "Rapid reps"],
            "breathingTips": ["Inhale down", "Exhale up"],
            "focusArea": ["Chest", "Arms"],
            "status": "in-progress"
          },
          {
            "title": "Standing Calf Raises",
            "duration": 30,
            "set": 3,
            "reps": 20,
            "restBetweenSet": 15,
            "instruction": "Raise heels slowly and lower controlled.",
            "animation": "calf-raises.gif",
            "commonMistakesToAvoid": ["Bouncing", "Not full range"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Calves"],
            "status": "in-progress"
          },
          {
            "title": "Seated Ab Crunch",
            "duration": 45,
            "set": 3,
            "reps": 15,
            "restBetweenSet": 20,
            "instruction": "Sit tall, crunch abs without pulling neck.",
            "animation": "seated-ab-crunch.gif",
            "commonMistakesToAvoid": ["Neck strain", "Using momentum"],
            "breathingTips": ["Exhale up", "Inhale down"],
            "focusArea": ["Abs"],
            "status": "in-progress"
          }
        ]
      },
      {
        "dayLabel": "Day 2",
        "dayDate": "2025-08-06",
        "rounds": [
          {
            "title": "Knee Push-ups",
            "duration": 45,
            "set": 3,
            "reps": 12,
            "restBetweenSet": 30,
            "instruction": "Keep knees on floor and body straight.",
            "animation": "knee-push-ups.gif",
            "commonMistakesToAvoid": ["Hips sagging", "Rapid reps"],
            "breathingTips": ["Inhale down", "Exhale up"],
            "focusArea": ["Chest", "Arms"],
            "status": "in-progress"
          },
          {
            "title": "Lunges",
            "duration": 60,
            "set": 3,
            "reps": 12,
            "restBetweenSet": 30,
            "instruction": "Step forward, bend knees 90 degrees.",
            "animation": "lunges.gif",
            "commonMistakesToAvoid": ["Knee past toes", "Leaning forward"],
            "breathingTips": ["Inhale down", "Exhale up"],
            "focusArea": ["Legs", "Glutes"],
            "status": "in-progress"
          },
          {
            "title": "Plank Hold",
            "duration": 60,
            "set": 3,
            "reps": 1,
            "restBetweenSet": 30,
            "instruction": "Keep body straight and core tight.",
            "animation": "plank.gif",
            "commonMistakesToAvoid": ["Sagging hips", "Holding breath"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Core"],
            "status": "in-progress"
          },
          {
            "title": "Glute Bridge",
            "duration": 45,
            "set": 3,
            "reps": 20,
            "restBetweenSet": 30,
            "instruction": "Lift hips up squeezing glutes.",
            "animation": "glute-bridge.gif",
            "commonMistakesToAvoid": ["Arching back", "Feet too far"],
            "breathingTips": ["Exhale up", "Inhale down"],
            "focusArea": ["Glutes", "Lower Back"],
            "status": "in-progress"
          }
        ]
      }
    ],
    "image": {
      "imageUrl": "https://example.com/images/beginner-full-body.jpg",
      "publicId": "beginner-full-body"
    }
  },
  {
    "title": "Intermediate Strength Builder",
    "description": "A 3-day intermediate workout to build strength and endurance.",
    "duration": 75,
    "category": "60f8c0f4e3a2f72b94a10c4d",
    "calories": 600,
    "level": "intermediate",
    "recommended": "NO",
    "roundsCount": 5,
    "planRounds": [
      {
        "dayLabel": "Day 1",
        "dayDate": "2025-08-07",
        "rounds": [
          {
            "title": "Pull Ups",
            "duration": 60,
            "set": 4,
            "reps": 10,
            "restBetweenSet": 60,
            "instruction": "Pull chin over bar with control.",
            "animation": "pull-ups.gif",
            "commonMistakesToAvoid": ["Swinging", "Partial reps"],
            "breathingTips": ["Exhale up", "Inhale down"],
            "focusArea": ["Back", "Arms"],
            "status": "in-progress"
          },
          {
            "title": "Dumbbell Bench Press",
            "duration": 75,
            "set": 4,
            "reps": 12,
            "restBetweenSet": 60,
            "instruction": "Lower dumbbells slowly to chest.",
            "animation": "dumbbell-bench-press.gif",
            "commonMistakesToAvoid": ["Bouncing weights", "Elbow flaring"],
            "breathingTips": ["Exhale up", "Inhale down"],
            "focusArea": ["Chest", "Triceps"],
            "status": "in-progress"
          },
          {
            "title": "Bent-over Rows",
            "duration": 60,
            "set": 4,
            "reps": 12,
            "restBetweenSet": 60,
            "instruction": "Keep back straight, row dumbbells to waist.",
            "animation": "bent-over-rows.gif",
            "commonMistakesToAvoid": ["Rounding back", "Using momentum"],
            "breathingTips": ["Exhale up", "Inhale down"],
            "focusArea": ["Back", "Biceps"],
            "status": "in-progress"
          },
          {
            "title": "Barbell Squats",
            "duration": 90,
            "set": 4,
            "reps": 10,
            "restBetweenSet": 90,
            "instruction": "Go down to parallel, keep chest up.",
            "animation": "barbell-squats.gif",
            "commonMistakesToAvoid": ["Knees past toes", "Leaning forward"],
            "breathingTips": ["Inhale down", "Exhale up"],
            "focusArea": ["Legs", "Glutes"],
            "status": "in-progress"
          },
          {
            "title": "Plank to Push-up",
            "duration": 60,
            "set": 3,
            "reps": 12,
            "restBetweenSet": 30,
            "instruction": "Transition smoothly between plank and push-up.",
            "animation": "plank-to-push-up.gif",
            "commonMistakesToAvoid": ["Sagging hips", "Poor form"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Core", "Chest"],
            "status": "in-progress"
          }
        ]
      },
      {
        "dayLabel": "Day 2",
        "dayDate": "2025-08-08",
        "rounds": [
          {
            "title": "Deadlifts",
            "duration": 90,
            "set": 4,
            "reps": 10,
            "restBetweenSet": 90,
            "instruction": "Keep back flat and lift with legs.",
            "animation": "deadlifts.gif",
            "commonMistakesToAvoid": ["Rounding back", "Jerking movement"],
            "breathingTips": ["Inhale down", "Exhale up"],
            "focusArea": ["Back", "Legs"],
            "status": "in-progress"
          },
          {
            "title": "Overhead Press",
            "duration": 60,
            "set": 4,
            "reps": 12,
            "restBetweenSet": 60,
            "instruction": "Press dumbbells overhead with control.",
            "animation": "overhead-press.gif",
            "commonMistakesToAvoid": ["Arching back", "Locking elbows"],
            "breathingTips": ["Exhale up", "Inhale down"],
            "focusArea": ["Shoulders", "Triceps"],
            "status": "in-progress"
          },
          {
            "title": "Dumbbell Curls",
            "duration": 45,
            "set": 4,
            "reps": 15,
            "restBetweenSet": 30,
            "instruction": "Keep elbows close, curl dumbbells.",
            "animation": "dumbbell-curls.gif",
            "commonMistakesToAvoid": ["Swinging arms", "Using back"],
            "breathingTips": ["Exhale up", "Inhale down"],
            "focusArea": ["Biceps"],
            "status": "in-progress"
          },
          {
            "title": "Leg Raises",
            "duration": 60,
            "set": 4,
            "reps": 20,
            "restBetweenSet": 30,
            "instruction": "Raise legs without arching back.",
            "animation": "leg-raises.gif",
            "commonMistakesToAvoid": ["Swinging legs", "Arching back"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Lower Abs"],
            "status": "in-progress"
          }
        ]
      },
      {
        "dayLabel": "Day 3",
        "dayDate": "2025-08-09",
        "rounds": [
          {
            "title": "Jump Rope",
            "duration": 90,
            "set": 3,
            "reps": 120,
            "restBetweenSet": 30,
            "instruction": "Jump with light feet and steady rhythm.",
            "animation": "jump-rope.gif",
            "commonMistakesToAvoid": ["Landing hard", "Tensing shoulders"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Cardio", "Legs"],
            "status": "in-progress"
          },
          {
            "title": "Box Jumps",
            "duration": 60,
            "set": 3,
            "reps": 15,
            "restBetweenSet": 45,
            "instruction": "Jump onto box with soft landing.",
            "animation": "box-jumps.gif",
            "commonMistakesToAvoid": ["Hard landing", "Poor knee alignment"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Legs", "Explosiveness"],
            "status": "in-progress"
          },
          {
            "title": "Russian Twists",
            "duration": 45,
            "set": 3,
            "reps": 30,
            "restBetweenSet": 30,
            "instruction": "Twist torso side to side, keep core tight.",
            "animation": "russian-twists.gif",
            "commonMistakesToAvoid": ["Using momentum", "Rounding back"],
            "breathingTips": ["Exhale on twist", "Inhale center"],
            "focusArea": ["Obliques", "Abs"],
            "status": "in-progress"
          },
          {
            "title": "Mountain Climbers",
            "duration": 30,
            "set": 4,
            "reps": 40,
            "restBetweenSet": 20,
            "instruction": "Drive knees quickly to chest.",
            "animation": "mountain-climbers.gif",
            "commonMistakesToAvoid": ["Hips too high", "Poor core engagement"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Cardio", "Core"],
            "status": "in-progress"
          }
        ]
      }
    ],
    "image": {
      "imageUrl": "https://example.com/images/intermediate-strength.jpg",
      "publicId": "intermediate-strength"
    }
  },
  {
    "title": "Quick HIIT Burn",
    "description": "A fast 2-day HIIT plan designed to burn calories and boost metabolism.",
    "duration": 30,
    "category": "60f8c0f4e3a2f72b94a10c4d",
    "calories": 450,
    "level": "advanced",
    "recommended": "YES",
    "roundsCount": 5,
    "planRounds": [
      {
        "dayLabel": "Day 1",
        "dayDate": "2025-08-10",
        "rounds": [
          {
            "title": "Burpees",
            "duration": 30,
            "set": 4,
            "reps": 20,
            "restBetweenSet": 15,
            "instruction": "Explode up from squat to jump.",
            "animation": "burpees.gif",
            "commonMistakesToAvoid": ["Not fully extending", "Hard landing"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Full Body", "Cardio"],
            "status": "in-progress"
          },
          {
            "title": "High Knees",
            "duration": 30,
            "set": 4,
            "reps": 30,
            "restBetweenSet": 10,
            "instruction": "Run in place lifting knees high.",
            "animation": "high-knees.gif",
            "commonMistakesToAvoid": ["Leaning back", "Not lifting knees"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Cardio", "Legs"],
            "status": "in-progress"
          },
          {
            "title": "Jump Lunges",
            "duration": 30,
            "set": 4,
            "reps": 15,
            "restBetweenSet": 20,
            "instruction": "Jump switching legs in a lunge position.",
            "animation": "jump-lunges.gif",
            "commonMistakesToAvoid": ["Knee past toes", "Poor landing"],
            "breathingTips": ["Exhale on jump", "Inhale landing"],
            "focusArea": ["Legs", "Glutes"],
            "status": "in-progress"
          },
          {
            "title": "Mountain Climbers",
            "duration": 30,
            "set": 4,
            "reps": 40,
            "restBetweenSet": 15,
            "instruction": "Drive knees quickly to chest.",
            "animation": "mountain-climbers.gif",
            "commonMistakesToAvoid": ["Hips too high", "Poor core engagement"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Core", "Cardio"],
            "status": "in-progress"
          },
          {
            "title": "Plank Hold",
            "duration": 45,
            "set": 3,
            "reps": 1,
            "restBetweenSet": 30,
            "instruction": "Hold plank position with tight core.",
            "animation": "plank.gif",
            "commonMistakesToAvoid": ["Sagging hips", "Holding breath"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Core"],
            "status": "in-progress"
          }
        ]
      },
      {
        "dayLabel": "Day 2",
        "dayDate": "2025-08-11",
        "rounds": [
          {
            "title": "Jump Rope",
            "duration": 60,
            "set": 3,
            "reps": 100,
            "restBetweenSet": 30,
            "instruction": "Maintain steady rhythm with light feet.",
            "animation": "jump-rope.gif",
            "commonMistakesToAvoid": ["Landing hard", "Tensing shoulders"],
            "breathingTips": ["Steady breathing"],
            "focusArea": ["Cardio", "Legs"],
            "status": "in-progress"
          },
          {
            "title": "Squat Jumps",
            "duration": 45,
            "set": 3,
            "reps": 15,
            "restBetweenSet": 30,
            "instruction": "Explode up from squat position.",
            "animation": "squat-jumps.gif",
            "commonMistakesToAvoid": ["Knees caving in", "Landing hard"],
            "breathingTips": ["Exhale on jump", "Inhale landing"],
            "focusArea": ["Legs", "Glutes"],
            "status": "in-progress"
          },
          {
            "title": "Push-ups",
            "duration": 45,
            "set": 3,
            "reps": 20,
            "restBetweenSet": 30,
            "instruction": "Keep body straight and lower chest slowly.",
            "animation": "push-ups.gif",
            "commonMistakesToAvoid": ["Sagging hips", "Rapid reps"],
            "breathingTips": ["Inhale down", "Exhale up"],
            "focusArea": ["Chest", "Arms"],
            "status": "in-progress"
          },
          {
            "title": "Bicycle Crunches",
            "duration": 45,
            "set": 3,
            "reps": 30,
            "restBetweenSet": 30,
            "instruction": "Twist torso and alternate knees to opposite elbows.",
            "animation": "bicycle-crunches.gif",
            "commonMistakesToAvoid": ["Pulling on neck", "Not fully twisting"],
            "breathingTips": ["Exhale during twist", "Inhale neutral"],
            "focusArea": ["Abs", "Obliques"],
            "status": "in-progress"
          }
        ]
      }
    ],
    "image": {
      "imageUrl": "https://example.com/images/quick-hiit-burn.jpg",
      "publicId": "quick-hiit-burn"
    }
  }
]

  
const Plan = require('../models/workoutPlan.model')

async function seedWorkoutPlans() {
  try {
    const sampleCategoryId = new mongoose.Types.ObjectId(
      "64fa7c841b0d78a34c5fc0c1"
    );
    const sampleUserId1 = new mongoose.Types.ObjectId(
      "64fa7e2b11f93424a9a63e91"
    );
    const sampleUserId2 = new mongoose.Types.ObjectId(
      "64fa7e2b11f93424a9a63e92"
    );

    const plans = [
      {
        title: "Full Body Shred",
        description: "High-intensity full body workout.",
        status: "active",
        image: {
          imageUrl: "https://example.com/images/fullbody.jpg",
          publicId: "fullbody_123",
        },
        youtubeLink: "https://youtube.com/watch?v=video1",
        category: sampleCategoryId,
        calories: 450,
        roundsCount: 3,
        duration: 30,
        level: "intermediate",
        recommended: "YES",
        planRounds: [
          {
            rounds: [
              {
                title: "Burpees",
                duration: 60,
                set: 3,
                animation: "https://example.com/burpees.gif",
                reps: 15,
                restBetweenSet: 20,
                instruction: "Jump high and push-up properly.",
                commonMistakesToAvoid: ["Skipping the jump", "Poor form"],
                workoutExerciseType: "set-reps",
                breathingTips: ["Exhale on jump"],
                focusArea: ["cardio", "full body"],
                status: "in-progress",
              },
            ],
          },
        ],
        ratings: [
          {
            userId: sampleUserId1,
            rating: 5,
            review: "Insane burn!",
            createdAt: new Date(),
          },
        ],
        averageRating: 5,
        totalRatings: 1,
      },
      {
        title: "Core Crusher",
        description: "Target your abs and core strength.",
        status: "active",
        image: {
          imageUrl: "https://example.com/images/core.jpg",
          publicId: "core_123",
        },
        youtubeLink: "https://youtube.com/watch?v=video2",
        category: sampleCategoryId,
        calories: 300,
        roundsCount: 2,
        duration: 20,
        level: "beginner",
        recommended: "NO",
        planRounds: [
          {
            rounds: [
              {
                title: "Plank",
                duration: 60,
                set: 2,
                animation: "https://example.com/plank.gif",
                reps: 1,
                restBetweenSet: 30,
                instruction: "Keep your back straight.",
                commonMistakesToAvoid: ["Sagging hips"],
                workoutExerciseType: "time",
                breathingTips: ["Steady breaths"],
                focusArea: ["core"],
                status: "in-progress",
              },
            ],
          },
        ],
        ratings: [],
        averageRating: 0,
        totalRatings: 0,
      },
      {
        title: "Leg Day Blast",
        description: "Focus on lower body strength.",
        status: "active",
        image: {
          imageUrl: "https://example.com/images/legs.jpg",
          publicId: "legs_123",
        },
        youtubeLink: "https://youtube.com/watch?v=video3",
        category: sampleCategoryId,
        calories: 400,
        roundsCount: 4,
        duration: 35,
        level: "advanced",
        recommended: "YES",
        planRounds: [
          {
            rounds: [
              {
                title: "Squats",
                duration: 45,
                set: 4,
                animation: "https://example.com/squats.gif",
                reps: 20,
                restBetweenSet: 20,
                instruction: "Keep knees behind toes.",
                commonMistakesToAvoid: ["Rounding back"],
                workoutExerciseType: "set-reps",
                breathingTips: ["Exhale when standing"],
                focusArea: ["legs", "glutes"],
                status: "in-progress",
              },
            ],
          },
        ],
        ratings: [
          {
            userId: sampleUserId2,
            rating: 4,
            review: "Challenging but rewarding.",
            createdAt: new Date(),
          },
        ],
        averageRating: 4,
        totalRatings: 1,
      },
      {
        title: "HIIT Express",
        description: "Quick and effective HIIT session.",
        status: "active",
        image: {
          imageUrl: "https://example.com/images/hiit.jpg",
          publicId: "hiit_123",
        },
        youtubeLink: "https://youtube.com/watch?v=video4",
        category: sampleCategoryId,
        calories: 500,
        roundsCount: 5,
        duration: 25,
        level: "intermediate",
        recommended: "NO",
        planRounds: [
          {
            rounds: [
              {
                title: "Mountain Climbers",
                duration: 40,
                set: 3,
                animation: "https://example.com/mountain.gif",
                reps: 30,
                restBetweenSet: 10,
                instruction: "Drive knees forward quickly.",
                commonMistakesToAvoid: ["Letting hips rise"],
                workoutExerciseType: "set-reps",
                breathingTips: ["Short controlled breaths"],
                focusArea: ["cardio", "core"],
                status: "in-progress",
              },
            ],
          },
        ],
        ratings: [],
        averageRating: 0,
        totalRatings: 0,
      },
      {
        title: "Upper Body Burn",
        description: "Tone your chest, arms, and back.",
        status: "active",
        image: {
          imageUrl: "https://example.com/images/upper.jpg",
          publicId: "upper_123",
        },
        youtubeLink: "https://youtube.com/watch?v=video5",
        category: sampleCategoryId,
        calories: 420,
        roundsCount: 3,
        duration: 28,
        level: "beginner",
        recommended: "YES",
        planRounds: [
          {
            rounds: [
              {
                title: "Push-ups",
                duration: 60,
                set: 3,
                animation: "https://example.com/pushups.gif",
                reps: 15,
                restBetweenSet: 15,
                instruction: "Lower chest to ground.",
                commonMistakesToAvoid: ["Flaring elbows"],
                workoutExerciseType: "set-reps",
                breathingTips: ["Exhale on push"],
                focusArea: ["chest", "arms"],
                status: "in-progress",
              },
            ],
          },
        ],
        ratings: [],
        averageRating: 0,
        totalRatings: 0,
      },
    ];

    await Plan.deleteMany(); // Optional: clear old data
    await Plan.insertMany(plans);
    console.log("✅ Seeded 5 workout plans successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

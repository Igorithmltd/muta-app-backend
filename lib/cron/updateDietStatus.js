const cron = require('node-cron');
const moment = require('moment');
const DietActionModel = require('../../models/dietAction.model'); // adjust as needed

// ⏰ Runs daily at 12:30 AM
cron.schedule('30 0 * * *', async () => {
  console.log("Running daily diet status updater...");

  const today = moment().startOf('day');

  try {
    const dietActions = await DietActionModel.find({
      status: { $ne: 'completed' },
      endDate: { $lte: today.toDate() },
    });

    for (const dietAction of dietActions) {
      let hasChanges = false;
      let totalTasks = 0;
      let completedTasks = 0;

      // Iterate through each day in dailyMealBreakdown
      for (const day of dietAction.dailyMealBreakdown) {
        for (const meal of day.meals) {
          totalTasks++;

          if (
            meal.status !== 'completed' &&
            meal.status !== 'missed' &&
            moment().isAfter(moment(meal.missedBy, 'HH:mm:ss'))
          ) {
            meal.status = 'missed';
            hasChanges = true;
          }

          if (meal.status === 'completed') {
            completedTasks++;
          }
        }
      }

      // ✅ Update progress
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      if (dietAction.progress !== progress) {
        dietAction.progress = progress;
        hasChanges = true;
      }

      // ✅ Mark diet as completed if all meals are marked
      const allMarked = dietAction.dailyMealBreakdown.every(day =>
        day.meals.every(meal => meal.status === 'completed' || meal.status === 'missed')
      );

      if (allMarked) {
        dietAction.status = 'completed';
        hasChanges = true;
      }

      if (hasChanges) {
        await dietAction.save();
      }
    }

    console.log("✅ Finished diet status updater");
  } catch (error) {
    console.error("❌ Error in scheduled diet updater:", error);
  }
});

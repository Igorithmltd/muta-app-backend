const cron = require('node-cron');
const moment = require('moment');
const DietActionModel = require('../../models/dietAction.model'); // adjust path

// Runs daily at 12:30 AM
cron.schedule('30 0 * * *', async () => {
  console.log("Running daily diet status updater");

  const today = moment().startOf('day');

  try {
    const dietActions = await DietActionModel.find({
      status: { $ne: 'completed' },
      endDate: { $lte: today.toDate() },
    });

    for (const dietAction of dietActions) {
      let hasChanges = false;

      for (const task of dietAction.dailyMealBreakdown) {
        if (
          task.status !== 'completed' &&
          task.status !== 'missed' &&
          moment().isAfter(moment(task.missedBy, 'HH:mm:ss'))
        ) {
          task.status = 'missed';
          hasChanges = true;
        }
      }

      const allMarked = dietAction.dailyMealBreakdown.every(
        (task) => task.status === 'completed' || task.status === 'missed'
      );

      if (allMarked) {
        dietAction.status = 'completed';

        const completedTasks = dietAction.dailyMealBreakdown.filter(
          (task) => task.status === 'completed'
        ).length;

        const totalTasks = dietAction.dailyMealBreakdown.length;
        dietAction.progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        hasChanges = true;
      }

      if (hasChanges) {
        await dietAction.save();
      }
    }

    console.log("Finished diet status updater");
  } catch (error) {
    console.error("Error in scheduled diet updater:", error);
  }
});

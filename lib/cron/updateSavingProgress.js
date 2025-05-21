const cron = require("node-cron");
const moment = require("moment");
const Saving = require("../../models/saving.model");
const SavingModel = require("../../models/saving.model");

const calculateProgress = (startDate, withdrawalDate) => {
  const now = moment(); // current time
  const start = moment(startDate); // saving start time
  const end = moment(withdrawalDate); // saving end time

  const totalDuration = end.diff(start); // total duration in milliseconds
  const elapsedDuration = now.diff(start); // elapsed duration in milliseconds

  // Calculate the percentage progress (1% increment based on total duration)
  let progress = (elapsedDuration / totalDuration) * 100;

  // Round the progress to the nearest integer, ensuring it's within 0-100% range
  progress = Math.min(Math.max(Math.floor(progress), 0), 100); // Ensure progress is between 0-100%

  return progress;
};

// cron.schedule("* * * * * *", async () => {
cron.schedule("0 0 * * *", async () => {
  //   console.log('Running daily saving progress update...');

  const savings = await SavingModel.find({ });
  //   console.log(savings)

  for (const saving of savings) {
    const match = saving.frequencyDuration.match(
      /^(\d+)(day|week|month|year)$/i
    );
    if (!match || !saving.withdrawalDate || !saving.startDate) continue;

    const unit = match[2].toLowerCase();
    const newProgress = calculateProgress(
      saving.startDate,
      saving.withdrawalDate,
      unit
    );
    // console.log(saving.startDate, saving.withdrawalDate)
    // console.log(newProgress);
    if (newProgress !== saving.savingProgress) {
      saving.savingProgress = newProgress;
      await saving.save();
    }
  }

  //   console.log('Finished updating saving progress.');
});

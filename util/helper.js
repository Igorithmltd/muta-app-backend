const jwt = require('jsonwebtoken')
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET


module.exports.generateOTP = ()=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports.verifyRefreshToken = (token)=> {
    return jwt.verify(token, REFRESH_SECRET);
}
module.exports.signAccessToken = (payload)=> {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "1h" });
}

module.exports.getCurrentWeekNumber = ()=> {
    const date = new Date();
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  }
  
  module.exports.formatNotificationTime = (date)=> {
    // Example output: "Tue, 12:09 PM"
    const options = { weekday: "short", hour: "numeric", minute: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }


  module.exports.getWeightImprovementTipsByWeight = (weightKg, heightCm)=> {
    const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // Determine BMI category
  let bmiCategory = '';
  if (bmi < 16.0) {
    bmiCategory = 'underweight';
  } else if (bmi >= 16.0 && bmi < 18.5) {
    bmiCategory = 'underweight';
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory = 'normal';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'overweight';
  } else {
    bmiCategory = 'obese';
  }

  // Tips dictionary
  const tips = {
    underweight: [
      "Eat more frequently and include healthy snacks.",
      "Increase intake of nutrient-rich foods with good calories.",
      "Incorporate strength training exercises to build muscle mass.",
      "Avoid empty-calorie foods and focus on balanced nutrition.",
      "Consult a nutritionist for a personalized meal plan.",
      "Stay hydrated but avoid drinking water before meals to avoid feeling full.",
    ],
    normal: [
      "Maintain a balanced diet with appropriate portion sizes.",
      "Continue regular physical activity to keep your weight stable.",
      "Include plenty of fruits, vegetables, whole grains, and lean proteins.",
      "Monitor your weight regularly to detect any changes early.",
      "Avoid excessive consumption of processed and sugary foods.",
      "Stay hydrated and get enough sleep.",
    ],
    overweight: [
      "Adopt a calorie-controlled, balanced diet focusing on whole foods.",
      "Increase daily physical activity, including cardio and strength training.",
      "Limit intake of sugary drinks and high-fat foods.",
      "Eat smaller, frequent meals to help control hunger.",
      "Track your food intake to identify and reduce excess calories.",
      "Consult a healthcare provider for personalized weight loss advice.",
    ],
    obese: [
      "Seek guidance from a healthcare professional for a tailored plan.",
      "Focus on a nutrient-dense, low-calorie diet with controlled portions.",
      "Incorporate regular, supervised physical activity gradually.",
      "Avoid fad diets; aim for sustainable, long-term changes.",
      "Consider behavioral therapy or support groups for motivation.",
      "Monitor your progress regularly and adjust your plan as needed.",
    ],
  };

  return tips[bmiCategory] || ["Maintain a healthy lifestyle with balanced diet and exercise."];
  }

  module.exports.getWeekRange = (offset = 0)=> {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day;
  
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + offset * 7);
    monday.setHours(0, 0, 0, 0);
  
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);
  
    return { from: monday, to: sunday };
  }
  

  module.exports.getClientGrowthDateRanges = () => {
    const now = new Date();
  
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
  
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  
    const endOfYesterday = new Date(startOfToday);
  
    const last7Days = new Date(startOfToday);
    last7Days.setDate(last7Days.getDate() - 7);
  
    const last30Days = new Date(startOfToday);
    last30Days.setDate(last30Days.getDate() - 30);
  
    return {
      today: { from: startOfToday, to: now },
      yesterday: { from: startOfYesterday, to: endOfYesterday },
      last7Days: { from: last7Days, to: now },
      last30Days: { from: last30Days, to: now },
    };
  }
  
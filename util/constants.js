
const EXPIRES_AT = 8 * 60 * 1000;
const DELIVERY_CHARGE = 1000

const ANALYSIS_RANGES = {
    "1W": { days: 7, interval: "day" },
    "1M": { days: 30, interval: "day" },
    "6M": { days: 180, interval: "week" },
    "1Y": { days: 365, interval: "month" },
    "ALL": { days: 0, interval: "day" }
  };

module.exports = {
    EXPIRES_AT,
    DELIVERY_CHARGE,
    ANALYSIS_RANGES
}
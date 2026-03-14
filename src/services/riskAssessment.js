function assessVitalsRisk(vitals = {}) {
  const heartRate = Number(vitals.heartRate || 0);
  const oxygen = Number(vitals.oxygen || 0);
  const systolic = Number(vitals.systolicBP || 0);
  const temperature = Number(vitals.temperatureC || 0);

  let score = 0;
  const flags = [];

  if (heartRate && (heartRate < 50 || heartRate > 120)) {
    score += 25;
    flags.push('Abnormal heart rate');
  }
  if (oxygen && oxygen < 92) {
    score += 35;
    flags.push('Low oxygen saturation');
  }
  if (systolic && (systolic > 160 || systolic < 90)) {
    score += 20;
    flags.push('Blood pressure out of safe range');
  }
  if (temperature && temperature >= 39.4) {
    score += 20;
    flags.push('High fever');
  }

  const level = score >= 60 ? 'CRITICAL' : score >= 35 ? 'HIGH' : score >= 15 ? 'MODERATE' : 'LOW';
  const advice = level === 'CRITICAL'
    ? 'Seek emergency care immediately.'
    : level === 'HIGH'
      ? 'Contact a doctor urgently today.'
      : level === 'MODERATE'
        ? 'Monitor vitals closely and consult a physician if persistent.'
        : 'Continue regular monitoring and healthy routine.';

  return {
    score,
    level,
    flags,
    advice
  };
}

module.exports = { assessVitalsRisk };

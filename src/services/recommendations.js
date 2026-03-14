const recommendationMap = {
  default: {
    medicines: [{ name: "Paracetamol", dosage: "500mg after meals", purpose: "Fever and mild pain relief" }],
    diet: ["Hydrate well", "Eat light home-cooked meals", "Avoid processed foods"],
    exercises: ["10-15 min walking", "Breathing exercises"],
    lifestyle: ["Sleep 7-8 hours", "Reduce stress", "Avoid smoking and alcohol"],
    precautions: ["Monitor worsening symptoms", "Seek doctor if no recovery in 48h"],
    followUpChecklist: ["Record temperature/symptoms twice daily", "Maintain medicine log", "Book physician review if symptoms persist"],
    expectedRecovery: "2-5 days for mild conditions"
  },
  "Heart Attack": {
    medicines: [{ name: "Aspirin (doctor-advised)", dosage: "Emergency supervised", purpose: "Platelet inhibition" }],
    diet: ["Low sodium diet", "Omega-3 rich foods", "Avoid trans fats"],
    exercises: ["Cardiac rehab only under medical advice"],
    lifestyle: ["Strict BP and sugar monitoring", "Stop tobacco immediately"],
    precautions: ["Call emergency services for chest pain >5 min", "Do not self-medicate"],
    followUpChecklist: ["Emergency ECG and troponin", "Cardiologist review in 24h", "Daily BP and pulse diary"],
    expectedRecovery: "Long-term supervised recovery"
  },
  Dengue: {
    medicines: [{ name: "Paracetamol", dosage: "500mg as advised", purpose: "Control fever" }],
    diet: ["ORS and coconut water", "Kiwi/papaya (supportive)", "Soft digestible meals"],
    exercises: ["Bed rest during fever phase"],
    lifestyle: ["Mosquito prevention", "Daily hydration tracking"],
    precautions: ["Avoid NSAIDs", "Watch for bleeding signs"],
    followUpChecklist: ["Daily platelet monitoring", "Track urine output", "Emergency visit for bleeding/vomiting"],
    expectedRecovery: "7-14 days with close monitoring"
  },
  Diabetes: {
    medicines: [{ name: "Metformin (doctor-prescribed)", dosage: "As advised", purpose: "Blood glucose control" }],
    diet: ["Low glycemic index foods", "High-fiber vegetables", "Portion control"],
    exercises: ["30 min brisk walk", "Strength training 3x/week"],
    lifestyle: ["Regular sugar monitoring", "Foot care and hydration"],
    precautions: ["Seek care if sugar persistently >250 mg/dL"],
    followUpChecklist: ["Fasting sugar log", "HbA1c every 3 months", "Yearly eye and kidney check"],
    expectedRecovery: "Chronic condition requiring long-term control"
  }
};

function buildRecommendations(prediction) {
  if (!prediction) return recommendationMap.default;
  return recommendationMap[prediction.disease] || recommendationMap.default;
}

module.exports = { buildRecommendations };

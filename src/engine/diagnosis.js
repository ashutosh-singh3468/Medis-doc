const CRITICAL_DISEASES = new Set(["Heart Attack", "Typhoid", "Dengue", "Malaria", "Jaundice", "Stroke", "Heat Stroke", "Appendicitis", "Tuberculosis", "Hepatitis B"]);

const DISEASE_MODELS = [
  { name: "Common Cold", severity: "Low", symptoms: ["runny nose", "sneezing", "sore throat", "mild fever", "cough"] },
  { name: "Flu", severity: "Medium", symptoms: ["fever", "body pain", "chills", "fatigue", "cough"] },
  { name: "COVID-19", severity: "High", symptoms: ["fever", "dry cough", "loss of taste", "breathlessness", "fatigue"] },
  { name: "Dengue", severity: "CRITICAL", symptoms: ["high fever", "joint pain", "rash", "headache", "nausea"] },
  { name: "Malaria", severity: "CRITICAL", symptoms: ["high fever", "chills", "sweating", "nausea", "headache"] },
  { name: "Typhoid", severity: "CRITICAL", symptoms: ["prolonged fever", "abdominal pain", "weakness", "constipation", "headache"] },
  { name: "Jaundice", severity: "CRITICAL", symptoms: ["yellow skin", "dark urine", "fatigue", "abdominal pain", "nausea"] },
  { name: "Heart Attack", severity: "CRITICAL", symptoms: ["chest pain", "breathlessness", "sweating", "nausea", "left arm pain"] },
  { name: "Stroke", severity: "CRITICAL", symptoms: ["face drooping", "speech difficulty", "arm weakness", "confusion", "headache"] },
  { name: "Asthma", severity: "High", symptoms: ["wheezing", "shortness of breath", "cough", "chest tightness"] },
  { name: "Pneumonia", severity: "High", symptoms: ["fever", "cough", "chest pain", "breathlessness", "fatigue"] },
  { name: "Bronchitis", severity: "Medium", symptoms: ["cough", "mucus", "fatigue", "chest discomfort"] },
  { name: "Migraine", severity: "Medium", symptoms: ["headache", "nausea", "light sensitivity", "blurred vision"] },
  { name: "Sinusitis", severity: "Low", symptoms: ["facial pain", "nasal congestion", "headache", "sore throat"] },
  { name: "Gastritis", severity: "Medium", symptoms: ["abdominal pain", "bloating", "nausea", "indigestion"] },
  { name: "Food Poisoning", severity: "High", symptoms: ["vomiting", "diarrhea", "abdominal pain", "fever", "dehydration"] },
  { name: "Diabetes", severity: "High", symptoms: ["frequent urination", "increased thirst", "weight loss", "fatigue"] },
  { name: "Hypertension", severity: "High", symptoms: ["headache", "dizziness", "chest pain", "blurred vision"] },
  { name: "Hypotension", severity: "Medium", symptoms: ["dizziness", "fainting", "blurred vision", "fatigue"] },
  { name: "Anemia", severity: "Medium", symptoms: ["fatigue", "pale skin", "dizziness", "shortness of breath"] },
  { name: "Kidney Infection", severity: "High", symptoms: ["back pain", "fever", "burning urination", "nausea"] },
  { name: "UTI", severity: "Medium", symptoms: ["burning urination", "frequent urination", "pelvic pain", "cloudy urine"] },
  { name: "Arthritis", severity: "Medium", symptoms: ["joint pain", "joint stiffness", "swelling", "reduced mobility"] },
  { name: "Tuberculosis", severity: "CRITICAL", symptoms: ["chronic cough", "weight loss", "night sweats", "fever"] },
  { name: "Hepatitis A", severity: "High", symptoms: ["yellow skin", "fatigue", "nausea", "loss of appetite"] },
  { name: "Hepatitis B", severity: "CRITICAL", symptoms: ["yellow skin", "abdominal pain", "dark urine", "joint pain"] },
  { name: "Conjunctivitis", severity: "Low", symptoms: ["red eyes", "itchy eyes", "watery eyes", "eye discharge"] },
  { name: "Chickenpox", severity: "Medium", symptoms: ["rash", "fever", "fatigue", "itching"] },
  { name: "Measles", severity: "High", symptoms: ["rash", "high fever", "cough", "runny nose"] },
  { name: "Otitis Media", severity: "Medium", symptoms: ["ear pain", "fever", "hearing difficulty", "irritability"] },
  { name: "Appendicitis", severity: "CRITICAL", symptoms: ["right abdominal pain", "nausea", "fever", "loss of appetite"] },
  { name: "Peptic Ulcer", severity: "High", symptoms: ["burning stomach pain", "bloating", "nausea", "heartburn"] },
  { name: "GERD", severity: "Medium", symptoms: ["heartburn", "acid reflux", "chest pain", "difficulty swallowing"] },
  { name: "Dermatitis", severity: "Low", symptoms: ["skin redness", "itching", "dry skin", "rash"] },
  { name: "Eczema", severity: "Low", symptoms: ["itching", "dry skin", "rash", "skin cracking"] },
  { name: "Psoriasis", severity: "Medium", symptoms: ["scaly skin", "itching", "joint pain", "dry skin"] },
  { name: "Depression", severity: "High", symptoms: ["low mood", "sleep disturbance", "fatigue", "loss of interest"] },
  { name: "Anxiety Disorder", severity: "Medium", symptoms: ["restlessness", "rapid heartbeat", "sweating", "sleep disturbance"] },
  { name: "Dehydration", severity: "Medium", symptoms: ["dry mouth", "dizziness", "dark urine", "fatigue"] },
  { name: "Heat Stroke", severity: "CRITICAL", symptoms: ["high body temperature", "confusion", "dry skin", "fainting"] }
];

const ALL_SYMPTOMS = [...new Set(DISEASE_MODELS.flatMap((d) => d.symptoms))].sort();

function applyModifiers(score, disease, patientContext) {
  let adjusted = score;
  const age = Number(patientContext.age || 0);
  if (age >= 60 && ["Pneumonia", "Heart Attack", "Stroke"].includes(disease.name)) adjusted += 0.08;
  if (age <= 12 && ["Chickenpox", "Otitis Media", "Measles"].includes(disease.name)) adjusted += 0.07;
  const gender = (patientContext.gender || "").toLowerCase();
  if (gender === "female" && disease.name === "Anemia") adjusted += 0.06;
  if (gender === "male" && disease.name === "Heart Attack") adjusted += 0.03;
  const season = (patientContext.season || "").toLowerCase();
  if (season === "monsoon" && ["Dengue", "Malaria", "Typhoid"].includes(disease.name)) adjusted += 0.1;
  if (season === "winter" && ["Flu", "Common Cold", "Pneumonia"].includes(disease.name)) adjusted += 0.07;
  return Math.min(0.99, adjusted);
}

function triageLevel(topPrediction) {
  if (!topPrediction) return "LOW";
  if (topPrediction.severity === "CRITICAL" || topPrediction.confidence >= 75) return "EMERGENCY";
  if (topPrediction.severity === "High" || topPrediction.confidence >= 55) return "PRIORITY";
  if (topPrediction.confidence >= 35) return "ROUTINE";
  return "WATCH";
}

function predictDiseases(inputSymptoms = [], patientContext = {}) {
  const normalized = inputSymptoms.map((s) => s.trim().toLowerCase()).filter(Boolean);
  const predictions = DISEASE_MODELS.map((disease) => {
    const matches = disease.symptoms.filter((s) => normalized.includes(s));
    const base = matches.length / disease.symptoms.length;
    const adjusted = applyModifiers(base, disease, patientContext);
    const missingSymptoms = disease.symptoms.filter((s) => !normalized.includes(s)).slice(0, 3);
    return {
      disease: disease.name,
      severity: disease.severity,
      confidence: Number((adjusted * 100).toFixed(1)),
      critical: CRITICAL_DISEASES.has(disease.name),
      matchingSymptoms: matches,
      missingSymptoms,
      explanation: matches.length
        ? `Matched ${matches.length}/${disease.symptoms.length} core signals`
        : "Low symptom overlap"
    };
  })
    .filter((d) => d.confidence >= 15)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  const topPrediction = predictions[0] || null;
  return {
    topPrediction,
    predictions,
    triage: triageLevel(topPrediction),
    criticalAlert: predictions.find((p) => p.critical && p.confidence >= 40) || null,
    suggestedNextSymptoms: ALL_SYMPTOMS.filter((s) => !normalized.includes(s)).slice(0, 12)
  };
}

function suggestSymptoms(query = "") {
  const q = query.trim().toLowerCase();
  return ALL_SYMPTOMS.filter((s) => s.includes(q)).slice(0, 20);
}

module.exports = {
  predictDiseases,
  suggestSymptoms,
  DISEASE_MODELS,
  ALL_SYMPTOMS
};

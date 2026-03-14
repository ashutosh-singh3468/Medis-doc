function buildFallbackResponse(message, context = {}) {
  const text = (message || '').toLowerCase();

  if (text.includes('hindi') || text.includes('हिंदी')) {
    return 'मैं बेसिक मेडिकल गाइडेंस दे सकता हूँ: पर्याप्त पानी पिएँ, आराम करें, और गंभीर लक्षण होने पर तुरंत डॉक्टर से संपर्क करें।';
  }
  if (text.includes('chest pain') || text.includes('heart')) {
    return 'Chest pain can be serious. If pain is intense, radiating, or with sweating/breathlessness, seek emergency care immediately.';
  }
  if (text.includes('fever')) {
    return 'For fever: hydrate, rest, monitor temperature every 4-6 hours, and seek a doctor if fever persists over 2 days or crosses 102°F.';
  }
  if (text.includes('diet')) {
    return 'Balanced plan: 50% vegetables, lean protein, whole grains, and reduced sugar/salt. Share your condition and I will personalize this.';
  }

  const predicted = context.lastPrediction?.disease;
  return predicted
    ? `Based on your recent ${predicted} assessment, focus on hydration, medication adherence, and timely follow-up. Share new symptoms for refinement.`
    : 'I can guide medical basics, but for diagnosis please provide symptoms in the prediction tool and consult a qualified doctor.';
}

module.exports = { buildFallbackResponse };

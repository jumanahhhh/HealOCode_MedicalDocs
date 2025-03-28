// Basic NLP functions for medical record summarization
// In a production app, this would use a more sophisticated NLP model

// Function to simplify medical terms
const simplifyMedicalTerms = (text: string): string => {
  const medicalTerms: Record<string, string> = {
    'hypertension': 'high blood pressure',
    'hyperlipidemia': 'high cholesterol',
    'myocardial infarction': 'heart attack',
    'cerebrovascular accident': 'stroke',
    'type 2 diabetes mellitus': 'type 2 diabetes',
    'arrhythmia': 'irregular heartbeat',
    'gastrointestinal': 'stomach and intestinal',
    'pulmonary': 'lung',
    'renal': 'kidney',
    'hepatic': 'liver',
    'ocular': 'eye',
    'dermatological': 'skin',
    'neurological': 'brain and nerve',
    'orthopedic': 'bone',
    'gynecological': 'women\'s reproductive',
    'urological': 'urinary',
    'neuropathic': 'nerve damage'
  };

  let simplifiedText = text;
  Object.keys(medicalTerms).forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    simplifiedText = simplifiedText.replace(regex, `${term} (${medicalTerms[term]})`);
  });

  return simplifiedText;
};

// Replace medical abbreviations with full terms
const expandAbbreviations = (text: string): string => {
  const abbreviations: Record<string, string> = {
    'bid': 'twice daily',
    'tid': 'three times daily',
    'qid': 'four times daily',
    'qd': 'once daily',
    'prn': 'as needed',
    'q4h': 'every 4 hours',
    'q6h': 'every 6 hours',
    'q8h': 'every 8 hours',
    'q12h': 'every 12 hours',
    'qhs': 'at bedtime',
    'ac': 'before meals',
    'pc': 'after meals',
    'po': 'by mouth',
    'IV': 'intravenous',
    'IM': 'intramuscular',
    'SC': 'subcutaneous',
    'BP': 'blood pressure',
    'HR': 'heart rate',
    'RR': 'respiratory rate',
    'T': 'temperature',
    'Hx': 'history',
    'Dx': 'diagnosis',
    'Tx': 'treatment',
    'Rx': 'prescription',
    'SOB': 'shortness of breath'
  };

  let expandedText = text;
  Object.keys(abbreviations).forEach(abbr => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'g');
    expandedText = expandedText.replace(regex, `${abbr} (${abbreviations[abbr]})`);
  });

  return expandedText;
};

// Extract key information from medical notes
const extractKeyInfo = (notes: any): string => {
  let summary = '';
  
  if (notes.diagnosis) {
    summary += `You have been diagnosed with ${notes.diagnosis}. `;
  }
  
  if (notes.medications && notes.medications.length > 0) {
    summary += `You are taking ${notes.medications.join(', ')}. `;
  }
  
  if (notes.vitals && notes.vitals.bp) {
    summary += `Your blood pressure is ${notes.vitals.bp}. `;
  }
  
  if (notes.recommendations) {
    summary += `Your doctor recommends ${notes.recommendations}. `;
  }
  
  return summary;
};

// Generate a patient-friendly summary from medical record
export const generatePatientFriendlySummary = (medicalRecord: any): string => {
  if (!medicalRecord) return '';
  
  try {
    let summary = '';
    
    // Extract diagnosis if available
    if (typeof medicalRecord.content === 'object' && medicalRecord.content.diagnosis) {
      summary += `You have ${medicalRecord.content.diagnosis}. `;
    } else if (typeof medicalRecord === 'string') {
      // If it's a string, try to extract information with regex
      const diagnosisMatch = medicalRecord.match(/diagnosis:?\s*([^.]+)/i);
      if (diagnosisMatch) summary += `You have ${diagnosisMatch[1]}. `;
    }
    
    // Add additional context
    if (typeof medicalRecord.content === 'object') {
      summary += extractKeyInfo(medicalRecord.content);
    }
    
    // Simplify and expand
    summary = simplifyMedicalTerms(summary);
    summary = expandAbbreviations(summary);
    
    // Add a general disclaimer
    summary += 'Please ask your healthcare provider if you have any questions about your condition or treatment.';
    
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate a summary. Please consult with your healthcare provider for information about your medical record.';
  }
};

// For demo purposes - generate a mock summary
export const generateMockSummary = (patientName: string, conditions: string[]): string => {
  return `${patientName} has ${conditions.join(', ')}. They're taking medications to manage these conditions. Their diabetes is improving with the current treatment plan (blood sugar levels have gone down). Their blood pressure is well-controlled. They sometimes have mild tingling in their feet, which is being monitored. The doctor recommends continuing medications, improving diet, and exercising regularly.`;
};

const Appointment = require('../../models/Appointment');

const MEDICAL_DISCLAIMER_PHRASE =
  'While I can help you organize and phrase questions for your visit, I cannot diagnose, interpret symptoms, or prescribe treatments. Be sure to discuss this directly with your healthcare provider!';

/**
 * Heuristic response generator when LLM API key is not configured or as fallback
 */
async function generateHeuristicReply(userMessage, userId, userName) {
  const rawMsg = (userMessage || '').trim();
  const msg = rawMsg.toLowerCase();

  // 1. Fetch user's upcoming appointments for personalization
  let upcomingAppts = [];
  try {
    if (userId) {
      upcomingAppts = await Appointment.find({ ownerId: userId, status: 'upcoming' })
        .sort({ scheduledAt: 1 })
        .limit(2);
    }
  } catch {
    // Ignore DB fetch failure in chat
  }

  const apptContext =
    upcomingAppts.length > 0
      ? `I see your upcoming visit "${upcomingAppts[0].title}"${
          upcomingAppts[0].providerName ? ` with ${upcomingAppts[0].providerName}` : ''
        }. `
      : '';

  // 2. How are you / check-in queries
  if (
    /\b(how are you|how're you|how r u|how are you doing|how is it going|how's it going|how do you do|how have you been|what's up|whats up|how are things)\b/i.test(msg) ||
    msg === 'how are you' ||
    msg === 'how are you?' ||
    msg === "how's it going" ||
    msg === 'whats up' ||
    msg === "what's up"
  ) {
    const friendName = userName ? `, ${userName}` : '';
    return {
      reply: `I'm doing well, thank you for asking${friendName}! 😊 I'm here and ready to help you prepare for your visits. How are you feeling about your upcoming appointment?`,
      suggestions: [
        'What questions should I ask?',
        "I'm a bit nervous about my visit",
        'What should I bring to my visit?',
      ],
    };
  }

  // 3. Greetings
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|howdy|sup)\b/i.test(msg) ||
    msg === 'hi' ||
    msg === 'hello' ||
    msg === 'hey'
  ) {
    const greetingName = userName ? `, ${userName}` : '';
    return {
      reply: `Hello${greetingName}! I'm your Appointment Prep Assistant. ${apptContext}I can help you brainstorm questions to ask your doctor, remind you what to bring, or guide you in organizing your self-reported medication list. What appointment would you like to prepare for?`,
      suggestions: [
        'What questions should I ask my doctor?',
        'What should I bring to my visit?',
        'How to list my medications?',
      ],
    };
  }

  // 4. Gratitude / Thanks
  if (
    /\b(thank you|thanks|thx|thank u|appreciate it|awesome|great job|thank you so much)\b/i.test(msg)
  ) {
    const friendName = userName ? `, ${userName}` : '';
    return {
      reply: `You're very welcome${friendName}! 😊 Helping you feel organized, confident, and prepared for your visit is my top priority. Let me know if you'd like to brainstorm more questions or review your checklist!`,
      suggestions: [
        'Checklist preview',
        'What questions should I ask?',
        'What should I bring to my visit?',
      ],
    };
  }

  // 5. Farewells
  if (
    /\b(bye|goodbye|see you|cya|take care|good night|have a good day)\b/i.test(msg)
  ) {
    const friendName = userName ? `, ${userName}` : '';
    return {
      reply: `Take care${friendName}! Wishing you a productive and smooth doctor's visit. Don't forget to take your printed checklist and a pen with you! 🩺`,
      suggestions: [
        'Checklist preview',
        'What should I bring?',
      ],
    };
  }

  // 6. Identity & capabilities
  if (
    /\b(who are you|what are you|what can you do|how can you help|help me|what do you do|help)\b/i.test(msg) ||
    msg === 'help' ||
    msg === 'who are you'
  ) {
    return {
      reply: `I'm your personal Appointment Prep Assistant! 🏥 I'm here to ensure you get the absolute most out of your doctor's consultations:\n\n• ❓ Brainstorm focused questions so you don't forget important topics in the exam room\n• 💊 Organize your self-reported medications, dosages, and schedules\n• 📄 Remind you of critical documents, IDs, and test results to bring\n• 📋 Format your clinical-friendly printed visit checklist\n• 📅 Track follow-up lab tests, specialist referrals, and next steps\n\nHow would you like to begin preparing today?`,
      suggestions: [
        'What questions should I ask my doctor?',
        'What should I bring to my visit?',
        'How to list my medications?',
      ],
    };
  }

  // 7. Anxiety / Nervousness
  if (
    /\b(nervous|anxious|anxiety|scared|worried|stress|stressed|overwhelmed|afraid|frightened)\b/i.test(msg)
  ) {
    return {
      reply: `It is completely normal to feel nervous or overwhelmed before a medical appointment! Many patients worry about forgetting things or feeling rushed.\n\nHere are 3 tips to help you feel centered and in control:\n1. ✍️ Write your concerns down: Having your questions printed ensures your doctor addresses what matters most to you.\n2. 👥 Bring a trusted companion: An advocate can take notes and give you peace of mind.\n3. ⏱️ Ask your doctor to slow down: It is always okay to say: "Could you please explain that again or write that down for me?"\n\nWould you like to draft your top 2 questions right now so they're on your checklist?`,
      suggestions: [
        'What questions should I ask my doctor?',
        'What should I bring to my visit?',
        'Checklist preview',
      ],
    };
  }

  // 8. Check upcoming appointments / schedule
  if (
    /\b(when is my|my next appointment|upcoming visit|my schedule|do i have an appointment|next appointment|next visit)\b/i.test(msg)
  ) {
    if (upcomingAppts.length > 0) {
      const first = upcomingAppts[0];
      const dateStr = first.scheduledAt
        ? new Date(first.scheduledAt).toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'an upcoming date';
      return {
        reply: `Your next appointment is "${first.title}"${
          first.providerName ? ` with ${first.providerName}` : ''
        } scheduled for ${dateStr}.${
          first.location ? ` Location: ${first.location}.` : ''
        }\n\nWould you like to brainstorm questions or review your checklist for this visit?`,
        suggestions: [
          'What questions should I ask my doctor?',
          'What should I bring to my visit?',
          'Checklist preview',
        ],
      };
    }
    return {
      reply: `You don't have any upcoming appointments scheduled right now. You can click the "+ New Appointment" button at the top of your dashboard to schedule your next visit and begin preparing!`,
      suggestions: [
        'What questions should I ask?',
        'What should I bring to my visit?',
      ],
    };
  }

  // 9. Specialties
  // Dental / Teeth
  if (/\b(dentist|dental|teeth|tooth|cavity|gums|floss)\b/i.test(msg)) {
    return {
      reply: `For a dental appointment, here are high-value questions to bring:\n1. "Are there any early signs of cavities, enamel erosion, or gum inflammation?"\n2. "Is my brushing and flossing technique effective, or are there areas I'm missing?"\n3. "Do you recommend any preventative treatments, such as a nightguard or fluoride?"\n4. "When should my next routine cleaning and exam be scheduled?"\n\nYou can add these to your "Questions to Ask" list so they appear on your printed checklist!`,
      suggestions: [
        'What should I bring to my visit?',
        'How to list my medications?',
        'Checklist preview',
      ],
    };
  }

  // Dermatology / Skin
  if (/\b(derma|dermatolog|skin|mole|rash|acne|eczema|psoriasis)\b/i.test(msg)) {
    return {
      reply: `For a dermatology visit, here are helpful questions to ask:\n1. "Could you examine this specific mole or spot that has changed in size, shape, or color?"\n2. "What daily skincare and sunscreen regimen do you recommend for my skin type?"\n3. "Could any of my current symptoms be related to an allergy, environment, or medication?"\n\n💡 Pro tip: Take photos of skin flare-ups when they are most prominent in case they clear up before your appointment!`,
      suggestions: [
        'What should I bring to my visit?',
        'Questions to ask doctor',
        'Checklist preview',
      ],
    };
  }

  // Eye / Optometry / Vision
  if (/\b(eye|vision|optometr|ophthalmolog|glasses|contacts|blurry)\b/i.test(msg)) {
    return {
      reply: `For an eye care visit, here are great questions to bring:\n1. "Has my prescription or visual clarity changed since my last exam?"\n2. "Are there any early signs of eye strain, dry eyes, or elevated intraocular pressure?"\n3. "Do you recommend specific screen-break habits or lubricating drops for my daily routine?"\n\nRemember to bring your current eyeglasses or contact lens prescription boxes to the exam!`,
      suggestions: [
        'What should I bring to my visit?',
        'Checklist preview',
      ],
    };
  }

  // Cardiology / Heart / Blood Pressure
  if (/\b(cardio|heart|blood pressure|hypertension|pulse|palpitation)\b/i.test(msg)) {
    return {
      reply: `For a cardiology or blood pressure visit, key questions include:\n1. "What is my ideal target blood pressure, and how often should I log readings at home?"\n2. "Are there specific dietary changes (such as lowering sodium) or exercises you recommend?"\n3. "What warning signs (like shortness of breath, dizziness, or chest tightness) should prompt a call?"\n\nBe sure to bring your recent home blood pressure readings log with you!`,
      suggestions: [
        'What should I bring to my visit?',
        'How to list my medications?',
        'Checklist preview',
      ],
    };
  }

  // Mental Health / Therapy
  if (/\b(mental health|therapy|therapist|psychiat|counsel|depression)\b/i.test(msg)) {
    return {
      reply: `For a mental health or therapy consultation, here are thoughtful questions to ask:\n1. "What therapeutic approach (e.g. CBT, mindfulness, or talk therapy) do you recommend for my goals?"\n2. "What milestones or signs of progress should we monitor together over the next few weeks?"\n3. "What daily coping strategies or exercises can I practice between our sessions?"\n\nRemember that your provider is there to provide compassionate, judgment-free support.`,
      suggestions: [
        'What questions should I ask?',
        'Checklist preview',
      ],
    };
  }

  // Pediatrics / Child
  if (/\b(pediatric|child|baby|kid|infant|toddler)\b/i.test(msg)) {
    return {
      reply: `For a pediatric appointment, important questions include:\n1. "Is my child meeting expected developmental, speech, and physical growth milestones?"\n2. "Are there any recommended immunizations or screenings due at this visit?"\n3. "What guidance do you have on their current sleep schedule, nutrition, and screen time?"\n\nDon't forget to bring your child's immunization record and growth booklet!`,
      suggestions: [
        'What should I bring to my visit?',
        'Checklist preview',
      ],
    };
  }

  // 10. App navigation & usage
  if (/\b(create appointment|add appointment|new appointment|schedule visit)\b/i.test(msg)) {
    return {
      reply: `To create an appointment:\n1. Click the green "+ New Appointment" button at the top right of your dashboard.\n2. Enter the title (e.g. "Annual Physical"), provider or doctor name, specialty, date, and location.\n3. Click "Create Appointment" to save. It will appear on your dashboard with complete preparation tools!`,
      suggestions: ['Questions to ask doctor', 'What should I bring?'],
    };
  }

  if (/\b(print|pdf|download checklist|how to print)\b/i.test(msg)) {
    return {
      reply: `To print your visit checklist or save it as a PDF:\n1. Click "Preparation checklist" on your dashboard, or click your appointment card and choose "Checklist Preview".\n2. Click the "Print Checklist" button at the top right.\n3. In your browser's print dialog, choose your physical printer or select "Save as PDF".\n\nThe checklist is formatted with checkboxes so you and your doctor can take notes during the exam!`,
      suggestions: ['What should I bring to visit?', 'Questions to ask doctor'],
    };
  }

  // 11. Questions advice
  if (
    msg.includes('question') ||
    msg.includes('ask') ||
    msg.includes('what to ask') ||
    msg.includes('concerns')
  ) {
    return {
      reply: `Here are 4 high-value questions patients often prioritize:\n1. "What is the primary cause of my current symptoms?"\n2. "What are the common side effects or risks of this treatment/dose?"\n3. "Are there lifestyle, diet, or exercise changes that could help?"\n4. "When should I expect improvement, and what warning signs should prompt a call?"\n\nYou can add any of these to your "Questions to Ask" list so they appear on your visit checklist!`,
      suggestions: [
        'What should I bring to my appointment?',
        'How to record my medications?',
        'Add a follow-up reminder',
      ],
    };
  }

  // 12. Medications / Prescriptions
  if (
    msg.includes('med') ||
    msg.includes('pill') ||
    msg.includes('drug') ||
    msg.includes('dose') ||
    msg.includes('prescription') ||
    msg.includes('supplement')
  ) {
    if (
      msg.includes('should i take') ||
      msg.includes('can i stop') ||
      msg.includes('is it safe') ||
      msg.includes('dose calculation') ||
      msg.includes('interaction')
    ) {
      return {
        reply: `${MEDICAL_DISCLAIMER_PHRASE}\n\nI recommend writing down: "Should my current dosage be adjusted?" or "Could my medications be causing these side effects?" in your Questions list right now so you don't forget during the visit.`,
        suggestions: ['Add to Questions to Ask', 'What to bring to visit?'],
      };
    }

    return {
      reply: `When recording your medications, be sure to list:\n• Medication or supplement brand/generic name\n• Current dose or strength (e.g. 500 mg, 1 tablet)\n• Schedule or frequency (e.g. Once daily with dinner)\n• Any notes on side effects you've experienced\n\nPreserving your exact notes helps your doctor see the full clinical picture without surprises!`,
      suggestions: ['Questions about side effects', 'Print my checklist'],
    };
  }

  // 13. What to bring / Checklist
  if (
    msg.includes('bring') ||
    msg.includes('checklist') ||
    msg.includes('prepare') ||
    msg.includes('documents') ||
    msg.includes('id') ||
    msg.includes('insurance')
  ) {
    return {
      reply: `Before heading to your appointment, ensure you have:\n1. 📄 Your printed Appointment Prep checklist (use the "Checklist" button to print or save as PDF)\n2. 🪪 Government photo ID and current health insurance card\n3. 💊 Your actual prescription bottles or complete self-reported list\n4. 📋 Recent lab results, imaging discs, or specialist notes\n5. 🖊️ A pen to jot down notes in Section 4 of your checklist during the visit`,
      suggestions: ['Questions to ask the doctor', 'How to record follow-ups?'],
    };
  }

  // 14. Follow-ups / Lab tests
  if (
    msg.includes('follow') ||
    msg.includes('test') ||
    msg.includes('lab') ||
    msg.includes('referral') ||
    msg.includes('mri') ||
    msg.includes('blood')
  ) {
    return {
      reply: `Tracking follow-up items is essential! Use your appointment's "Follow-up Actions & To-Dos" section to record:\n• Lab tests to schedule (e.g., fasting lipid panel in 6 weeks)\n• Specialist referrals to contact\n• Target due dates so you receive reminders on your dashboard.`,
      suggestions: ['Checklist preview', 'Questions for doctor'],
    };
  }

  // 15. Medical diagnosis attempt / Clinical triage / Symptoms
  if (
    msg.includes('diagnos') ||
    msg.includes('symptom') ||
    msg.includes('pain') ||
    msg.includes('headache') ||
    msg.includes('fever') ||
    msg.includes('cough') ||
    msg.includes('nausea') ||
    msg.includes('stomach') ||
    msg.includes('dizzy') ||
    msg.includes('fatigue') ||
    msg.includes('disease') ||
    msg.includes('cure') ||
    msg.includes('treat') ||
    msg.includes('cancer') ||
    msg.includes('covid') ||
    msg.includes('infection') ||
    msg.includes('sick') ||
    msg.includes('hurt')
  ) {
    return {
      reply: `${MEDICAL_DISCLAIMER_PHRASE}\n\nTo help your doctor evaluate this accurately during your visit, here are 3 questions to add to your list:\n1. "I've been experiencing these symptoms for [duration]. What potential causes should we investigate?"\n2. "What red-flag signs or changes should prompt urgent care before our next follow-up?"\n3. "Are there diagnostic tests, lab work, or imaging you recommend to pinpoint the issue?"\n\nWould you like to add these questions to your visit checklist?`,
      suggestions: ['Questions to ask doctor', 'What should I bring to visit?'],
    };
  }

  // 16. Default helpful response (Warm, conversational, never robotic)
  const followUpPrompt =
    upcomingAppts.length > 0
      ? `Would you like to prepare questions or verify what to bring for "${upcomingAppts[0].title}"?`
      : 'What appointment or questions would you like to prepare for today?';

  return {
    reply: `I'm here to help you get completely ready for your doctor's visit! 📋\n\nHere is how I can assist:\n• Brainstorm smart, focused questions for your doctor\n• Guide you on what IDs, insurance cards, and medical records to bring\n• Give tips on organizing your self-reported medication list\n• Prepare a printable clinical checklist for your consultation\n\n${followUpPrompt}`,
    suggestions: [
      'Questions to ask doctor',
      'What should I bring?',
      'Checklist preview',
    ],
  };
}

/**
 * Handle POST /api/v1/assistant/chat
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Message is required.',
        },
      });
    }

    const trimmedMsg = message.trim();
    const userId = req.user?.id;
    const userName = req.user?.name || '';

    // If GEMINI_API_KEY is configured in the environment, attempt Gemini API call
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
          process.env.GEMINI_API_KEY
        )}`;

        const systemPrompt = `You are the Appointment Prep Assistant inside the Appointment Prep web application.
Your role is to help patients prepare for medical appointments: brainstorming questions to ask their doctor, reminding them what documents/medications to bring, and organizing notes.
STRICT NON-NEGOTIABLE RULE: You must never diagnose diseases, interpret symptoms clinically, or prescribe/alter medications or dosages. When clinical questions arise, remind the user to ask their doctor and suggest phrasing the question for their visit.
Keep answers concise, warm, actionable, and formatted with bullet points where helpful.`;

        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemPrompt}\n\nUser Name: ${userName}\nUser Message: ${trimmedMsg}`,
                  },
                ],
              },
            ],
          }),
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const replyText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return res.status(200).json({
              reply: replyText.trim(),
              suggestions: [
                'Questions to ask doctor',
                'What should I bring?',
                'Medication list tips',
              ],
            });
          }
        }
      } catch (err) {
        // Fall through to heuristic engine if Gemini call encounters network or config error
      }
    }

    // Heuristic Engine
    const result = await generateHeuristicReply(trimmedMsg, userId, userName);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

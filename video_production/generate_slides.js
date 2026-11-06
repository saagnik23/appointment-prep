const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Slide 1: The Fragmentation Hook
const slide1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="s1bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12241B"/>
      <stop offset="60%" stop-color="#183627"/>
      <stop offset="100%" stop-color="#0E1A14"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#s1bg)"/>
  <circle cx="960" cy="540" r="500" fill="#2F6B50" opacity="0.12" filter="blur(80px)"/>

  <!-- Top Badge -->
  <g transform="translate(960, 160)" text-anchor="middle">
    <rect x="-160" y="-22" width="320" height="44" rx="22" fill="#203E2F" stroke="#36664F" stroke-width="1.5"/>
    <text y="6" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="700" fill="#7FD38C" letter-spacing="2">THE PROBLEM</text>
  </g>

  <!-- Big Hook Title -->
  <text x="960" y="270" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="64" font-weight="800" fill="#FFFFFF" letter-spacing="-1.5">
    Important Appointments. Scattered Preparation.
  </text>
  <text x="960" y="330" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="26" font-weight="400" fill="#9FB8A8">
    When consultation time is limited to 15 minutes, forgotten questions become lost opportunities.
  </text>

  <!-- Scattered Note Cards -->
  <g transform="translate(300, 430)">
    <!-- Card 1: Notes App -->
    <g transform="translate(0, 40) rotate(-4)" filter="url(#cardShadow)">
      <rect width="360" height="260" rx="16" fill="#FDF6B8"/>
      <rect x="24" y="24" width="60" height="10" rx="5" fill="#E3B341"/>
      <text x="24" y="70" font-family="-apple-system, sans-serif" font-size="20" font-weight="700" fill="#6B5900">Notes App</text>
      <text x="24" y="110" font-family="-apple-system, sans-serif" font-size="16" fill="#7D6A0E">• Ask about fatigue?</text>
      <text x="24" y="140" font-family="-apple-system, sans-serif" font-size="16" fill="#7D6A0E">• What was dosage?</text>
      <text x="24" y="170" font-family="-apple-system, sans-serif" font-size="16" fill="#7D6A0E">• Bring blood pressure log</text>
      <rect x="24" y="200" width="180" height="28" rx="8" fill="#F5E48C"/>
      <text x="36" y="220" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" fill="#8A6B0A">WHERE WAS THIS SAVED?</text>
    </g>

    <!-- Card 2: Calendar Fragment -->
    <g transform="translate(480, 0) rotate(2)" filter="url(#cardShadow)">
      <rect width="360" height="260" rx="16" fill="#FFFFFF"/>
      <rect width="360" height="60" rx="16" fill="#EF5350"/>
      <text x="30" y="40" font-family="-apple-system, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Calendar Alert</text>
      <text x="30" y="105" font-family="-apple-system, sans-serif" font-size="20" font-weight="700" fill="#13241B">10:30 AM Consultation</text>
      <text x="30" y="135" font-family="-apple-system, sans-serif" font-size="15" fill="#718096">Dr. Carter (Clinic Room ???)</text>
      <rect x="30" y="165" width="300" height="50" rx="10" fill="#FFF5F5" stroke="#FEB2B2"/>
      <text x="45" y="196" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" fill="#C53030">No preparation notes attached</text>
    </g>

    <!-- Card 3: Crumpled Receipt -->
    <g transform="translate(960, 60) rotate(5)" filter="url(#cardShadow)">
      <rect width="360" height="260" rx="16" fill="#F7FAFC"/>
      <text x="25" y="50" font-family="-apple-system, sans-serif" font-size="18" font-weight="800" fill="#2D3748">Prescription Receipt</text>
      <text x="25" y="90" font-family="-apple-system, sans-serif" font-size="14" fill="#4A5568">Rx: Example Med A</text>
      <text x="25" y="120" font-family="-apple-system, sans-serif" font-size="14" fill="#4A5568">Instructions smeared...</text>
      <rect x="25" y="160" width="310" height="40" rx="8" fill="#EDF2F7"/>
      <text x="40" y="185" font-family="-apple-system, sans-serif" font-size="13" fill="#718096">Left in kitchen drawer</text>
    </g>
  </g>

  <!-- Bottom Punchline -->
  <g transform="translate(960, 890)" text-anchor="middle">
    <rect x="-380" y="-30" width="760" height="60" rx="30" fill="#3D1D1D" stroke="#A83232" stroke-width="1.5"/>
    <text y="8" font-family="-apple-system, sans-serif" font-size="22" font-weight="600" fill="#FFC9C9">Result: Rushed visits, forgotten questions, and post-appointment regret</text>
  </g>
</svg>`;

// Slide 2: The Solution Reveal
const slide2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="s2bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F4F6F2"/>
      <stop offset="50%" stop-color="#EBF1E8"/>
      <stop offset="100%" stop-color="#DDE8DA"/>
    </linearGradient>
    <filter id="s2shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="20" stdDeviation="24" flood-color="#1A3828" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#s2bg)"/>

  <!-- Left Side: Branding & Value Prop -->
  <g transform="translate(140, 240)">
    <rect width="230" height="46" rx="23" fill="#E0EDE0" stroke="#B8D7B8" stroke-width="1.5"/>
    <circle cx="28" cy="23" r="7" fill="#2F6B50"/>
    <text x="46" y="29" font-family="-apple-system, sans-serif" font-size="15" font-weight="700" fill="#2F6B50" letter-spacing="1">THE PRIVATE WORKSPACE</text>

    <text x="0" y="140" font-family="-apple-system, sans-serif" font-size="88" font-weight="800" fill="#13241B" letter-spacing="-2">Appointment</text>
    <text x="0" y="235" font-family="-apple-system, sans-serif" font-size="88" font-weight="800" fill="#2F6B50" letter-spacing="-2">Prep</text>

    <text x="0" y="315" font-family="-apple-system, sans-serif" font-size="30" font-weight="500" fill="#425C4C">
      Prepare better. Remember what matters. Stay organised.
    </text>

    <text x="0" y="375" font-family="-apple-system, sans-serif" font-size="20" fill="#6B8576" width="600">
      One calm, private workspace to gather appointment details, questions,
    </text>
    <text x="0" y="405" font-family="-apple-system, sans-serif" font-size="20" fill="#6B8576">
      self-reported medications, and follow-up actions before you meet your doctor.
    </text>

    <g transform="translate(0, 460)">
      <rect width="280" height="64" rx="32" fill="#2F6B50"/>
      <text x="140" y="38" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#FFFFFF">Explore Features →</text>
    </g>
  </g>

  <!-- Right Side: Hero UI Preview Card -->
  <g transform="translate(980, 160)" filter="url(#s2shadow)">
    <rect width="780" height="760" rx="28" fill="#FFFFFF" stroke="#E2EAE0" stroke-width="2"/>
    
    <!-- Header bar -->
    <rect width="780" height="90" rx="28" fill="#F9FAF7"/>
    <circle cx="45" cy="45" r="18" fill="#2F6B50"/>
    <text x="75" y="52" font-family="-apple-system, sans-serif" font-size="22" font-weight="800" fill="#13241B">Appointment Prep</text>
    <rect x="610" y="25" width="130" height="40" rx="20" fill="#E8F4EC"/>
    <text x="675" y="49" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" fill="#2F6B50">Alex Morgan</text>

    <!-- Readiness score -->
    <g transform="translate(50, 130)">
      <rect width="680" height="170" rx="20" fill="#F4F8F4" stroke="#D3E5D4"/>
      <!-- Circle progress -->
      <circle cx="100" cy="85" r="55" fill="none" stroke="#D7E8D8" stroke-width="12"/>
      <circle cx="100" cy="85" r="55" fill="none" stroke="#2F6B50" stroke-width="12" stroke-dasharray="345" stroke-dashoffset="50" stroke-linecap="round" transform="rotate(-90 100 85)"/>
      <text x="100" y="93" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="26" font-weight="800" fill="#13241B">86%</text>

      <text x="190" y="65" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" fill="#13241B">Ready for Consultation</text>
      <text x="190" y="98" font-family="-apple-system, sans-serif" font-size="16" fill="#526F5E">Greenfield Medical Centre • Dr. Emily Carter</text>
      <text x="190" y="125" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" fill="#2F6B50">3 Questions Ready • 1 Medication Logged • 2 Actions</text>
    </g>

    <!-- 4 Section Pills -->
    <g transform="translate(50, 340)">
      <rect width="325" height="160" rx="18" fill="#FBFDFB" stroke="#E2EBE0"/>
      <text x="25" y="45" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#2F6B50">📋 Questions to Ask</text>
      <text x="25" y="80" font-family="-apple-system, sans-serif" font-size="14" fill="#333">• What should I bring?</text>
      <text x="25" y="110" font-family="-apple-system, sans-serif" font-size="14" fill="#333">• Discuss energy levels</text>
      <text x="25" y="138" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" fill="#7FD38C">+ Add New Question</text>

      <g transform="translate(355, 0)">
        <rect width="325" height="160" rx="18" fill="#FBFDFB" stroke="#E2EBE0"/>
        <text x="25" y="45" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#2F6B50">💊 Self-Reported Meds</text>
        <text x="25" y="80" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" fill="#333">Example Medication A</text>
        <text x="25" y="105" font-family="-apple-system, sans-serif" font-size="13" fill="#666">10 mg • Once daily with breakfast</text>
        <text x="25" y="138" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" fill="#7FD38C">+ Add Medication</text>
      </g>
    </g>

    <!-- Generate checklist button preview -->
    <g transform="translate(50, 540)">
      <rect width="680" height="90" rx="18" fill="#2F6B50"/>
      <text x="340" y="52" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">✨ Generate Visit Checklist</text>
      <text x="340" y="75" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="13" fill="#B3DFC0">Produces single-page physical &amp; mobile consultation sheet</text>
    </g>
  </g>
</svg>`;

// Slide 3: The 3-Step Power Workflow
const slide3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="s3bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F7F9F6"/>
      <stop offset="100%" stop-color="#E6EFE4"/>
    </linearGradient>
    <filter id="colShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#122B1E" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#s3bg)"/>

  <!-- Top Banner -->
  <g transform="translate(960, 110)" text-anchor="middle">
    <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#E2EBE0" stroke="#C8D9C5" stroke-width="1.5"/>
    <text y="6" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#2F6B50" letter-spacing="1.5">INTUITIVE 3-STEP WORKFLOW</text>
    <text y="80" font-family="-apple-system, sans-serif" font-size="52" font-weight="800" fill="#13241B" letter-spacing="-1">Everything You Need Before You Walk In</text>
  </g>

  <!-- Step 1 Card -->
  <g transform="translate(120, 270)" filter="url(#colShadow)">
    <rect width="500" height="660" rx="24" fill="#FFFFFF" stroke="#E2EBE0" stroke-width="2"/>
    <rect width="500" height="90" rx="24" fill="#2F6B50"/>
    <text x="35" y="42" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#7FD38C">STEP 1</text>
    <text x="35" y="68" font-family="-apple-system, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Prioritize Questions</text>

    <g transform="translate(30, 130)">
      <text x="0" y="0" font-family="-apple-system, sans-serif" font-size="16" fill="#476051">Record your exact questions in your own words.</text>
      
      <!-- Question item 1 -->
      <g transform="translate(0, 30)">
        <rect width="440" height="110" rx="14" fill="#F5F8F5" stroke="#D3E5D4"/>
        <circle cx="28" cy="35" r="10" fill="#2F6B50"/>
        <text x="28" y="40" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF">1</text>
        <text x="50" y="38" font-family="-apple-system, sans-serif" font-size="15" font-weight="700" fill="#13241B">What should I bring?</text>
        <text x="50" y="65" font-family="-apple-system, sans-serif" font-size="13" fill="#666">Confirm recent lab summaries</text>
        <rect x="50" y="78" width="80" height="20" rx="10" fill="#E8F4EC"/>
        <text x="90" y="92" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" fill="#2F6B50">PRIORITY: HIGH</text>
      </g>

      <!-- Question item 2 -->
      <g transform="translate(0, 160)">
        <rect width="440" height="110" rx="14" fill="#F5F8F5" stroke="#D3E5D4"/>
        <circle cx="28" cy="35" r="10" fill="#2F6B50"/>
        <text x="28" y="40" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF">2</text>
        <text x="50" y="38" font-family="-apple-system, sans-serif" font-size="15" font-weight="700" fill="#13241B">Discuss energy levels</text>
        <text x="50" y="65" font-family="-apple-system, sans-serif" font-size="13" fill="#666">Noticed afternoon fatigue past month</text>
      </g>

      <!-- Question item 3 -->
      <g transform="translate(0, 290)">
        <rect width="440" height="110" rx="14" fill="#F5F8F5" stroke="#D3E5D4"/>
        <circle cx="28" cy="35" r="10" fill="#2F6B50"/>
        <text x="28" y="40" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF">3</text>
        <text x="50" y="38" font-family="-apple-system, sans-serif" font-size="15" font-weight="700" fill="#13241B">Next steps clarification</text>
        <text x="50" y="65" font-family="-apple-system, sans-serif" font-size="13" fill="#666">Review timeline for referral</text>
      </g>
    </g>
  </g>

  <!-- Step 2 Card -->
  <g transform="translate(710, 270)" filter="url(#colShadow)">
    <rect width="500" height="660" rx="24" fill="#FFFFFF" stroke="#E2EBE0" stroke-width="2"/>
    <rect width="500" height="90" rx="24" fill="#2F6B50"/>
    <text x="35" y="42" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#7FD38C">STEP 2</text>
    <text x="35" y="68" font-family="-apple-system, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">Log Medications Verbatim</text>

    <g transform="translate(30, 130)">
      <text x="0" y="0" font-family="-apple-system, sans-serif" font-size="16" fill="#476051">Self-reported regimen without automated alteration.</text>
      
      <g transform="translate(0, 30)">
        <rect width="440" height="230" rx="14" fill="#F5F8F5" stroke="#D3E5D4"/>
        <rect x="25" y="25" width="390" height="40" rx="8" fill="#FFFFFF" stroke="#CCDED0"/>
        <text x="40" y="50" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" fill="#13241B">Example Medication A</text>

        <rect x="25" y="80" width="185" height="40" rx="8" fill="#FFFFFF" stroke="#CCDED0"/>
        <text x="40" y="105" font-family="-apple-system, sans-serif" font-size="14" fill="#13241B">Dose: 10 mg</text>

        <rect x="230" y="80" width="185" height="40" rx="8" fill="#FFFFFF" stroke="#CCDED0"/>
        <text x="245" y="105" font-family="-apple-system, sans-serif" font-size="14" fill="#13241B">Once daily</text>

        <rect x="25" y="135" width="390" height="70" rx="8" fill="#FFFFFF" stroke="#CCDED0"/>
        <text x="40" y="160" font-family="-apple-system, sans-serif" font-size="13" fill="#555">Patient Note: Taken with breakfast;</text>
        <text x="40" y="180" font-family="-apple-system, sans-serif" font-size="13" fill="#555">no adverse effects observed.</text>
      </g>

      <g transform="translate(0, 290)">
        <rect width="440" height="110" rx="14" fill="#FFFBF5" stroke="#EAD9BD"/>
        <text x="20" y="35" font-family="-apple-system, sans-serif" font-size="15" font-weight="700" fill="#8C5C1E">🛡️ Strict Administrative Safety</text>
        <text x="20" y="65" font-family="-apple-system, sans-serif" font-size="13" fill="#7A5623">Zero clinical dosages generated.</text>
        <text x="20" y="85" font-family="-apple-system, sans-serif" font-size="13" fill="#7A5623">Stores only what you enter.</text>
      </g>
    </g>
  </g>

  <!-- Step 3 Card -->
  <g transform="translate(1300, 270)" filter="url(#colShadow)">
    <rect width="500" height="660" rx="24" fill="#FFFFFF" stroke="#E2EBE0" stroke-width="2"/>
    <rect width="500" height="90" rx="24" fill="#2F6B50"/>
    <text x="35" y="42" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#7FD38C">STEP 3</text>
    <text x="35" y="68" font-family="-apple-system, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">One-Click Clinical Checklist</text>

    <g transform="translate(30, 130)">
      <text x="0" y="0" font-family="-apple-system, sans-serif" font-size="16" fill="#476051">Compiled ready for the consultation room.</text>
      
      <g transform="translate(0, 30)">
        <rect width="440" height="370" rx="14" fill="#FFFFFF" stroke="#CCDED0" filter="url(#colShadow)"/>
        <rect width="440" height="50" rx="14" fill="#F4F8F4"/>
        <text x="25" y="32" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" fill="#13241B">CONSULTATION SUMMARY SHEET</text>

        <text x="25" y="80" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" fill="#2F6B50">VISIT DETAILS</text>
        <text x="25" y="100" font-family="-apple-system, sans-serif" font-size="13" fill="#333">Dr. Emily Carter • Greenfield Centre</text>

        <text x="25" y="135" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" fill="#2F6B50">QUESTIONS (3)</text>
        <text x="25" y="155" font-family="-apple-system, sans-serif" font-size="12" fill="#333">[ ] 1. What information to bring?</text>
        <text x="25" y="175" font-family="-apple-system, sans-serif" font-size="12" fill="#333">[ ] 2. Discuss energy levels</text>
        <text x="25" y="195" font-family="-apple-system, sans-serif" font-size="12" fill="#333">[ ] 3. Clarify follow-up timeline</text>

        <text x="25" y="230" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" fill="#2F6B50">CURRENT MEDICATIONS</text>
        <text x="25" y="250" font-family="-apple-system, sans-serif" font-size="12" fill="#333">• Example Med A (10mg once daily)</text>

        <text x="25" y="285" font-family="-apple-system, sans-serif" font-size="13" font-weight="700" fill="#2F6B50">FOLLOW-UP ACTIONS</text>
        <text x="25" y="305" font-family="-apple-system, sans-serif" font-size="12" fill="#333">[ ] Schedule fasting bloodwork</text>

        <rect x="25" y="325" width="390" height="28" rx="6" fill="#EAF3EC"/>
        <text x="220" y="344" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" fill="#2F6B50">🖨️ Clean @media print Layout</text>
      </g>
    </g>
  </g>
</svg>`;

// Slide 4: Physical Outcome & Privacy
const slide4Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="s4bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12241B"/>
      <stop offset="100%" stop-color="#1E3E2E"/>
    </linearGradient>
    <filter id="shieldShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#s4bg)"/>

  <!-- Centered Shield & Boundary Statement -->
  <g transform="translate(960, 200)" text-anchor="middle">
    <!-- Badge -->
    <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#203E2F" stroke="#36664F" stroke-width="1.5"/>
    <text y="6" font-family="-apple-system, sans-serif" font-size="15" font-weight="700" fill="#7FD38C" letter-spacing="2">PRODUCT POSITIONING &amp; PRIVACY</text>

    <!-- Main Title -->
    <text y="100" font-family="-apple-system, sans-serif" font-size="58" font-weight="800" fill="#FFFFFF" letter-spacing="-1.5">
      Zero Clinical Diagnosis. 100% Patient Empowerment.
    </text>
    <text y="160" font-family="-apple-system, sans-serif" font-size="24" font-weight="400" fill="#A4C1B0">
      Appointment Prep assists your communication without ever interfering with clinical decisions.
    </text>
  </g>

  <!-- Side-by-Side Comparison Grid -->
  <g transform="translate(360, 440)">
    <!-- What It DOES -->
    <g transform="translate(0, 0)" filter="url(#shieldShadow)">
      <rect width="560" height="420" rx="24" fill="#FFFFFF"/>
      <rect width="560" height="80" rx="24" fill="#2F6B50"/>
      <text x="40" y="48" font-family="-apple-system, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">✔ What Appointment Prep Does</text>
      
      <g transform="translate(40, 120)">
        <text x="0" y="20" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#13241B">✔ Structured Visit Organization</text>
        <text x="0" y="45" font-family="-apple-system, sans-serif" font-size="15" fill="#526F5E">Stores questions, dates, rooms, and doctor details.</text>

        <text x="0" y="95" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#13241B">✔ Verbatim Medication Logging</text>
        <text x="0" y="120" font-family="-apple-system, sans-serif" font-size="15" fill="#526F5E">Preserves self-reported dosages exactly as entered.</text>

        <text x="0" y="170" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#13241B">✔ Instant Print &amp; Mobile Checklist</text>
        <text x="0" y="195" font-family="-apple-system, sans-serif" font-size="15" fill="#526F5E">One clean sheet ready for the consultation room.</text>

        <text x="0" y="245" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#13241B">✔ Isolated, Protected Data</text>
        <text x="0" y="270" font-family="-apple-system, sans-serif" font-size="15" fill="#526F5E">HttpOnly session cookies with strict user ownership.</text>
      </g>
    </g>

    <!-- What It NEVER DOES -->
    <g transform="translate(640, 0)" filter="url(#shieldShadow)">
      <rect width="560" height="420" rx="24" fill="#FFFFFF"/>
      <rect width="560" height="80" rx="24" fill="#B93838"/>
      <text x="40" y="48" font-family="-apple-system, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">✖ What Appointment Prep Never Does</text>
      
      <g transform="translate(40, 120)">
        <text x="0" y="20" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#902626">✖ Never Diagnoses Medical Conditions</text>
        <text x="0" y="45" font-family="-apple-system, sans-serif" font-size="15" fill="#745A5A">No symptom checkers or automated triage.</text>

        <text x="0" y="95" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#902626">✖ Never Recommends or Alters Drugs</text>
        <text x="0" y="120" font-family="-apple-system, sans-serif" font-size="15" fill="#745A5A">No interaction algorithms or dosage modifications.</text>

        <text x="0" y="170" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#902626">✖ Not an AI Doctor or EHR</text>
        <text x="0" y="195" font-family="-apple-system, sans-serif" font-size="15" fill="#745A5A">Does not make clinical decisions.</text>

        <text x="0" y="245" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#902626">✖ Never Sells or Shares Your Notes</text>
        <text x="0" y="270" font-family="-apple-system, sans-serif" font-size="15" fill="#745A5A">Zero advertising trackers or third-party brokers.</text>
      </g>
    </g>
  </g>
</svg>`;

// Slide 5: Outro & Call to Action
const slide5Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="s5bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F4F6F2"/>
      <stop offset="60%" stop-color="#EAF0E7"/>
      <stop offset="100%" stop-color="#DBE6D7"/>
    </linearGradient>
    <filter id="brandGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#122B1E" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#s5bg)"/>
  <circle cx="960" cy="540" r="400" fill="#7FD38C" opacity="0.12" filter="blur(90px)"/>

  <!-- Centered Brand Card -->
  <g transform="translate(960, 420)" text-anchor="middle">
    <!-- Logo Symbol -->
    <circle cx="0" cy="-140" r="48" fill="#2F6B50" filter="url(#brandGlow)"/>
    <path d="M-18 -140 L-6 -128 L18 -152" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Brand Name -->
    <text y="-30" font-family="-apple-system, sans-serif" font-size="84" font-weight="800" fill="#13241B" letter-spacing="-2">Appointment Prep</text>

    <!-- Tagline -->
    <text y="50" font-family="-apple-system, sans-serif" font-size="34" font-weight="600" fill="#2F6B50" letter-spacing="-0.5">
      Prepare better. Remember what matters. Stay organised.
    </text>

    <text y="110" font-family="-apple-system, sans-serif" font-size="22" font-weight="400" fill="#526F5E">
      The private healthcare visit preparation web application.
    </text>

    <!-- Links Pill Box -->
    <g transform="translate(0, 180)">
      <rect x="-340" y="-36" width="680" height="72" rx="36" fill="#FFFFFF" stroke="#C8D9C5" stroke-width="2" filter="url(#brandGlow)"/>
      <text y="8" font-family="-apple-system, sans-serif" font-size="22" font-weight="700" fill="#2F6B50">
        🌐 backendcia2.vercel.app
      </text>
    </g>

    <!-- Stack Pill Footnote -->
    <g transform="translate(0, 310)">
      <rect x="-260" y="-18" width="520" height="36" rx="18" fill="#E2EBE0"/>
      <text y="5" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" fill="#3D5A49">
        React 18 • Node.js Express API • MongoDB Atlas Persistent Storage
      </text>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'slide1.svg'), slide1Svg);
fs.writeFileSync(path.join(assetsDir, 'slide2.svg'), slide2Svg);
fs.writeFileSync(path.join(assetsDir, 'slide3.svg'), slide3Svg);
fs.writeFileSync(path.join(assetsDir, 'slide4.svg'), slide4Svg);
fs.writeFileSync(path.join(assetsDir, 'slide5.svg'), slide5Svg);

console.log('Saved all 5 slide SVGs successfully in video_production/assets/');


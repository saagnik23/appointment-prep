/**
 * Pure deterministic transformation of an Appointment document into a checklist presentation model.
 *
 * Rules:
 * - Uses only stored, user-entered information.
 * - Preserves exact wording.
 * - Never adds medical recommendations, diagnosis, dosage calculations or triage.
 * - Same input produces identical output every time.
 */
function transformToChecklist(appointment) {
  if (!appointment) {
    throw new Error('Appointment object is required for checklist transformation.');
  }

  // Sort questions deterministically by order ascending, then by createdAt ascending
  const rawQuestions = Array.isArray(appointment.questions) ? [...appointment.questions] : [];
  const sortedQuestions = rawQuestions.sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });

  const questionItems = sortedQuestions.map((q) => ({
    id: q._id ? q._id.toString() : q.id,
    text: q.text ? q.text.trim() : '',
    status: q.status || 'not_asked',
    order: typeof q.order === 'number' ? q.order : 0,
  }));

  // Sort medications deterministically by order ascending, then createdAt ascending
  const rawMedications = Array.isArray(appointment.medications) ? [...appointment.medications] : [];
  const sortedMedications = rawMedications.sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });

  const medicationItems = sortedMedications.map((m) => ({
    id: m._id ? m._id.toString() : m.id,
    name: m.name ? m.name.trim() : '',
    dose: m.dose ? m.dose.trim() : '',
    frequency: m.frequency ? m.frequency.trim() : '',
    notes: m.notes ? m.notes.trim() : '',
    order: typeof m.order === 'number' ? m.order : 0,
  }));

  // Sort follow-ups deterministically by dueAt ascending (nulls last), then createdAt
  const rawFollowUps = Array.isArray(appointment.followUps) ? [...appointment.followUps] : [];
  const sortedFollowUps = rawFollowUps.sort((a, b) => {
    if (a.dueAt && !b.dueAt) return -1;
    if (!a.dueAt && b.dueAt) return 1;
    if (a.dueAt && b.dueAt) {
      const dueDiff = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      if (dueDiff !== 0) return dueDiff;
    }
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });

  const followUpItems = sortedFollowUps.map((f) => ({
    id: f._id ? f._id.toString() : f.id,
    text: f.text ? f.text.trim() : '',
    dueAt: f.dueAt ? new Date(f.dueAt).toISOString() : null,
    status: f.status || 'pending',
  }));

  return {
    appointment: {
      id: appointment._id ? appointment._id.toString() : appointment.id,
      title: appointment.title ? appointment.title.trim() : '',
      providerName: appointment.providerName ? appointment.providerName.trim() : '',
      scheduledAt: appointment.scheduledAt ? new Date(appointment.scheduledAt).toISOString() : null,
      location: appointment.location ? appointment.location.trim() : '',
      status: appointment.status || 'upcoming',
      notes: appointment.notes ? appointment.notes.trim() : '',
    },
    sections: [
      {
        id: 'questions',
        title: 'Questions to ask',
        items: questionItems,
      },
      {
        id: 'medications',
        title: 'Medication list entered by me',
        items: medicationItems,
      },
      {
        id: 'follow_ups',
        title: 'Follow-up actions and notes',
        items: followUpItems,
      },
    ],
    notesArea: true,
    disclaimer:
      'This checklist is generated exclusively from patient-recorded notes to assist in preparation. It does not contain medical advice, diagnosis, or clinical recommendations.',
  };
}

module.exports = {
  transformToChecklist,
};

const Appointment = require('../../models/Appointment');

/* ================= QUESTIONS ================= */

async function addQuestion(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const { text, order } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
    }

    const defaultOrder =
      typeof order === 'number' ? order : appointment.questions.length;

    appointment.questions.push({
      text: text.trim(),
      status: 'not_asked',
      order: defaultOrder,
    });

    await appointment.save();

    const createdQuestion = appointment.questions[appointment.questions.length - 1];
    return res.status(201).json(createdQuestion);
  } catch (error) {
    next(error);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const { appointmentId, questionId } = req.params;
    const { text, status, order } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
    }

    const question = appointment.questions.id(questionId);
    if (!question) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Question not found.' },
      });
    }

    if (text !== undefined) question.text = text.trim();
    if (status !== undefined) question.status = status;
    if (typeof order === 'number') question.order = order;

    await appointment.save();

    return res.status(200).json(question);
  } catch (error) {
    next(error);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const { appointmentId, questionId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
    }

    const question = appointment.questions.id(questionId);
    if (!question) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Question not found.' },
      });
    }

    question.deleteOne();
    await appointment.save();

    return res.status(200).json({ message: 'Question deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/* ================= MEDICATIONS ================= */

async function addMedication(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const { name, dose, frequency, notes, order } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
    }

    const defaultOrder =
      typeof order === 'number' ? order : appointment.medications.length;

    appointment.medications.push({
      name: name.trim(),
      dose: dose ? dose.trim() : '',
      frequency: frequency ? frequency.trim() : '',
      notes: notes ? notes.trim() : '',
      order: defaultOrder,
    });

    await appointment.save();

    const createdMedication = appointment.medications[appointment.medications.length - 1];
    return res.status(201).json(createdMedication);
  } catch (error) {
    next(error);
  }
}

async function updateMedication(req, res, next) {
  try {
    const { appointmentId, medicationId } = req.params;
    const { name, dose, frequency, notes, order } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
    }

    const medication = appointment.medications.id(medicationId);
    if (!medication) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Medication entry not found.' },
      });
    }

    if (name !== undefined) medication.name = name.trim();
    if (dose !== undefined) medication.dose = dose.trim();
    if (frequency !== undefined) medication.frequency = frequency.trim();
    if (notes !== undefined) medication.notes = notes.trim();
    if (typeof order === 'number') medication.order = order;

    await appointment.save();

    return res.status(200).json(medication);
  } catch (error) {
    next(error);
  }
}

async function deleteMedication(req, res, next) {
  try {
    const { appointmentId, medicationId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
    }

    const medication = appointment.medications.id(medicationId);
    if (!medication) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Medication entry not found.' },
      });
    }

    medication.deleteOne();
    await appointment.save();

    return res.status(200).json({ message: 'Medication deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/* ================= FOLLOW-UPS ================= */

async function addFollowUp(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const { text, dueAt } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
    }

    appointment.followUps.push({
      text: text.trim(),
      dueAt: dueAt ? new Date(dueAt) : null,
      status: 'pending',
    });

    await appointment.save();

    const createdFollowUp = appointment.followUps[appointment.followUps.length - 1];
    return res.status(201).json(createdFollowUp);
  } catch (error) {
    next(error);
  }
}

async function updateFollowUp(req, res, next) {
  try {
    const { appointmentId, followUpId } = req.params;
    const { text, dueAt, status } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
    }

    const followUp = appointment.followUps.id(followUpId);
    if (!followUp) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Follow-up action not found.' },
      });
    }

    if (text !== undefined) followUp.text = text.trim();
    if (dueAt !== undefined) followUp.dueAt = dueAt ? new Date(dueAt) : null;
    if (status !== undefined) followUp.status = status;

    await appointment.save();

    return res.status(200).json(followUp);
  } catch (error) {
    next(error);
  }
}

async function deleteFollowUp(req, res, next) {
  try {
    const { appointmentId, followUpId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
      });
    }

    const followUp = appointment.followUps.id(followUpId);
    if (!followUp) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Follow-up action not found.' },
      });
    }

    followUp.deleteOne();
    await appointment.save();

    return res.status(200).json({ message: 'Follow-up action deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addMedication,
  updateMedication,
  deleteMedication,
  addFollowUp,
  updateFollowUp,
  deleteFollowUp,
};

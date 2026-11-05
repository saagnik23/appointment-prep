const Appointment = require('../../models/Appointment');

async function listAppointments(req, res, next) {
  try {
    const { status, search } = req.query;
    const filter = { ownerId: req.user.id };

    if (status && ['upcoming', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { providerName: { $regex: sanitized, $options: 'i' } },
        { location: { $regex: sanitized, $options: 'i' } },
      ];
    }

    const appointments = await Appointment.find(filter)
      .sort({ scheduledAt: -1, createdAt: -1 })
      .lean();

    const formatted = appointments.map((apt) => ({
      id: apt._id.toString(),
      title: apt.title,
      providerName: apt.providerName || '',
      scheduledAt: apt.scheduledAt || null,
      location: apt.location || '',
      status: apt.status || 'upcoming',
      notes: apt.notes || '',
      questionsCount: Array.isArray(apt.questions) ? apt.questions.length : 0,
      medicationsCount: Array.isArray(apt.medications) ? apt.medications.length : 0,
      followUpsCount: Array.isArray(apt.followUps) ? apt.followUps.length : 0,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
}

async function createAppointment(req, res, next) {
  try {
    const { title, providerName, scheduledAt, location, notes, status } = req.body;

    const appointment = await Appointment.create({
      ownerId: req.user.id,
      title: title.trim(),
      providerName: providerName ? providerName.trim() : '',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      location: location ? location.trim() : '',
      notes: notes ? notes.trim() : '',
      status: status || 'upcoming',
      questions: [],
      medications: [],
      followUps: [],
    });

    return res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
}

async function getAppointment(req, res, next) {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found.',
        },
      });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const { title, providerName, scheduledAt, location, notes, status } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found.',
        },
      });
    }

    if (title !== undefined) appointment.title = title.trim();
    if (providerName !== undefined) appointment.providerName = providerName.trim();
    if (scheduledAt !== undefined) appointment.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (location !== undefined) appointment.location = location.trim();
    if (notes !== undefined) appointment.notes = notes.trim();
    if (status !== undefined) appointment.status = status;

    await appointment.save();

    return res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOneAndDelete({
      _id: appointmentId,
      ownerId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found.',
        },
      });
    }

    return res.status(200).json({
      message: 'Appointment and all associated preparation data deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAppointments,
  createAppointment,
  getAppointment,
  updateAppointment,
  deleteAppointment,
};

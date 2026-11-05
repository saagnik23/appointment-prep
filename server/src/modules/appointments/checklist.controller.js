const Appointment = require('../../models/Appointment');
const { transformToChecklist } = require('../../utils/checklistTransformer');

async function getChecklist(req, res, next) {
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

    const checklist = transformToChecklist(appointment);
    return res.status(200).json(checklist);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getChecklist,
};

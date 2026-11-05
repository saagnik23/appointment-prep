const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [1000, 'Question text cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['not_asked', 'asked'],
      default: 'not_asked',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
      maxlength: [200, 'Medication name cannot exceed 200 characters'],
    },
    dose: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Dose cannot exceed 100 characters'],
    },
    frequency: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Frequency cannot exceed 100 characters'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Medication notes cannot exceed 500 characters'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

medicationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

const followUpSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Follow-up text is required'],
      trim: true,
      maxlength: [500, 'Follow-up text cannot exceed 500 characters'],
    },
    dueAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

followUpSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

const appointmentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Appointment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    providerName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Provider name cannot exceed 150 characters'],
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: '',
      maxlength: [250, 'Location cannot exceed 250 characters'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Preparation notes cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    questions: [questionSchema],
    medications: [medicationSchema],
    followUps: [followUpSchema],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user appointments retrieval
appointmentSchema.index({ ownerId: 1, scheduledAt: -1 });
appointmentSchema.index({ ownerId: 1, status: 1 });

appointmentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;

  if (Array.isArray(obj.questions)) {
    obj.questions = obj.questions.map((q) => {
      const qObj = { ...q, id: q._id ? q._id.toString() : q.id };
      delete qObj._id;
      return qObj;
    });
  }
  if (Array.isArray(obj.medications)) {
    obj.medications = obj.medications.map((m) => {
      const mObj = { ...m, id: m._id ? m._id.toString() : m.id };
      delete mObj._id;
      return mObj;
    });
  }
  if (Array.isArray(obj.followUps)) {
    obj.followUps = obj.followUps.map((f) => {
      const fObj = { ...f, id: f._id ? f._id.toString() : f.id };
      delete fObj._id;
      return fObj;
    });
  }

  return obj;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;


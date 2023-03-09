// associations.js

const defineAssociations = (models) => {
    const { Appointment, Doctor, Patient } = models;

    Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
    Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
    Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
    Patient.hasMany(Appointment, { foreignKey: 'patientId' });
};

module.exports = defineAssociations;

const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection.js");
const Doctor = require("./doctor.js");
const Patient = require("./patient.js");

const Appointment = sequelize.define("Appointment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    appointmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Doctor,
            key: "id",
        },
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Patient,
            key: "id",
        },
    },
});

Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });


module.exports = Appointment;

const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection.js");

const Patient = sequelize.define("Patient", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('patient', 'doctor', 'admin'),
        allowNull: false,
        defaultValue: 'patient'
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
});

module.exports = Patient;

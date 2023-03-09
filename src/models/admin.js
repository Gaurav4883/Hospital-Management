const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection.js');

const Admin = sequelize.define('Admin', {
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
        type: DataTypes.STRING,
        defaultValue: 'admin',
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
});

sequelize.sync().then(() => {
    // Create default admin account if it doesn't exist after we find
    Admin.findOrCreate({
        where: { email: 'admin@admin.com' }, // Use env file and store pwd and email there in production level
        defaults: {
            password: 'admin',
            isAdmin: true,
            role: 'admin',
        },
    });
});

module.exports = Admin;

const passport = require("passport")
const passportJwt = require("passport-jwt")
const dotenv = require("dotenv").config()

const Doctor = require("../models/doctor.js")
const Patient = require("../models/patient.js")
const Admin = require("../models/admin.js")

// Configuring JWT strategy for Passport.js
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
        try {
            if (jwtPayload.role === 'patient') {
                const user = await Patient.findByPk(jwtPayload.id);
                return done(null, user);
            }
            if (jwtPayload.role === 'doctor') {
                const user = await Doctor.findByPk(jwtPayload.id);
                return done(null, user);
            }
            if (jwtPayload.role === 'admin') {
                const user = await Admin.findByPk(jwtPayload.id);
                return done(null, user);
            }
            return done(null, false);
        } catch (err) {
            console.error(err);
            return done(err);
        }
    })
);
const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv").config()
const { default: helmet } = require("helmet")
const app = express()
const PORT = 5000
const jwt = require("jsonwebtoken")
const passport = require("passport")
require("./src/auth/passport.js")

app.set('view-engine', 'ejs')
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// Initialize passport
app.use(passport.initialize());

const sequelize = require("./src/database/connection.js");
const defineAssociations = require('./src/models/associations.js');
const Doctor = require("./src/models/doctor.js")
const Patient = require("./src/models/patient.js")
const Appointment = require("./src/models/appointment.js")
const Admin = require("./src/models/admin.js")
sequelize.sync();
defineAssociations({ Appointment, Doctor, Patient });

// Home Page
app.get('/', (req, res) => {
    res.render('home.ejs')
})

// Book Appointment
// ------------------------GET--------------------------------------------------
// IT DIDn't work on browser 
// app.get('/appointment/register', passport.authenticate('jwt', { session: false }), async (req, res) => {
//     if (req.user.role === 'patient') {
//         const doctors = await Doctor.findAll();
//         res.render('appointment.ejs', { doctors })
//     } else {
//         res.json({ message: 'Unknown role' });
//     }
// })


app.get('/appointment/register', async (req, res) => {
    const doctors = await Doctor.findAll();
    res.render('appointment.ejs', { doctors })
})
// ------------------------POST------------------------------------------------
app.post('/appointment/register', async (req, res) => {
    const { email, doctorId, appointmentDate, startTime, endTime } = req.body;

    try {
        // Search for the patient by email
        const patient = await Patient.findOne({ where: { email } });
        if (!patient) {
            return res.render('patient_dashboard.ejs', { message: "Patient not found." });
        }
        const appointment = await Appointment.create({
            doctorId,
            patientId: patient.id, // Use the patient's id
            appointmentDate,
            startTime,
            endTime
        });

        if (appointment) {
            // const jwtToken = jwt.sign({ id: appointment.id, role: 'appointment' }, process.env.JWT_SECRET, { expiresIn: '30m' });
            return res.render('patient_dashboard.ejs', { message: "Appointment booked successfully!" });
        } else {
            return res.render('patient_dashboard.ejs', { message: "Unable to book appointment." });
        }
    } catch (err) {
        console.error(err);
        return res.json({ message: 'Server error' });
    }
})

app.get("/myappointments", async (req, res) => {
    const appointments = await Appointment.findAll();
    res.render('myappt.ejs', { appointments })
})

app.get("/logout", (req, res) => {
    res.redirect('/login')
})
app.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.findAll();
        res.render('doctors.ejs', { doctors });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});
app.get('/patients', async (req, res) => {
    try {
        const patients = await Patient.findAll();
        res.render('patients.ejs', { patients });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});



// LOGIN PAGE
// ------------------------GET-------------------------------------------------
app.get('/login', (req, res) => {
    res.render('login.ejs', { message: "Proceed to Login !" })
})
// ------------------------POST------------------------------------------------
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let user;
    try {
        user = await Patient.findOne({ where: { email, password } });
        if (user) {
            const jwtToken = jwt.sign({ id: user.id, email: user.email, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '30m' })
            console.log(jwtToken);
            return res.render('patient_dashboard.ejs', { message: "Successfully logged in !" })
            // return res.json(jwtToken)
        }
        user = await Doctor.findOne({ where: { email, password } });
        if (user) {
            const jwtToken = jwt.sign({ id: user.id, email: user.email, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '30m' })
            console.log(jwtToken);
            return res.render('doctor_dashboard.ejs', { message: "Successfully logged in !" })
        }
        user = await Admin.findOne({ where: { email, password } });
        if (user) {
            const jwtToken = jwt.sign({ id: user.id, email: user.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30m' })
            return res.render('admin_dashboard.ejs', { message: "Successfully logged in !" })
        }
        return res.render('login.ejs', { message: "Invalid credentials" })

    } catch (err) {
        console.error(err);
        return res.json({ message: 'Server error' });
    }
});

// REGISTER PAGE
// ------------------------GET------------------------------------------------
app.get('/patient/register', (req, res) => {
    res.render('register_patient.ejs', { message: "" })
})
app.get('/doctor/register', (req, res) => {
    res.render('register_doctor.ejs', { message: "" })
})
// ------------------------POST-------------------------------------------------
app.post('/patient/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body)
        // if a user with the same email already exists
        const existingUser = await Patient.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).render('register_patient.ejs',
                { message: 'Patient already exists' });
        }
        // Creating a new patient 
        const newPatient = await Patient.create({
            fullName: name,
            email: email,
            password: password,
            role: 'patient',
        });
        return res.status(201).render('login.ejs', { message: 'Registration Successfull' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
})


app.post('/doctor/register', async (req, res) => {
    const { name, email, password, license, specialization } = req.body;
    try {
        const existingDoctor = await Doctor.findOne({ where: { email } });
        if (existingDoctor) {
            return res.status(409).render('register_doctor.ejs',
                { message: 'Doctor already exists' });
        }
        const newDoctor = await Doctor.create({
            fullName: name,
            email,
            password,
            role: 'doctor',
            specialization,
            licenseNumber: license,
        });
        return res.status(201).render('login.ejs',
            { message: 'Registered as Dr. Successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

})

// app.use(middlewares.notFound)
// app.use(middlewares.errorHandler)


// Listening on express app we created
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})



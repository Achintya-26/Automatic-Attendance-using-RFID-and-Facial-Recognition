import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';

import saveAttendance from './controllers/saveAttendance.js';
import teacherLogin from './controllers/teacherLogin.js';
import createLecture from './controllers/createLecture.js';
import cookieParser from 'cookie-parser';
import { hardwareMiddleware, loginMiddleware, sessionCheckerMiddleware } from './middlewares/index.js';
import lectureReport from './controllers/lectureReport.js';
import { format } from 'date-fns';
import studentAttendanceReport from './controllers/studentAttendanceReport.js';

dotenv.config();

const app = express();
const port = 3001 || process.env.PORT;
const store = new session.MemoryStore();

// app.use(cors({ origin: 'http://192.168.1.12:5173', credentials: true }));

// const allowedOrigins = ['http://192.168.1.12:5173','http://localhost:5173','http://192.168.56.1:5173']; // List of allowed origins
const allowedOrigins = ['http://192.168.224.120:5173','http://localhost:5173','http://192.168.56.1:5173/'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or Postman) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  credentials: true, // Allow sending cookies/credentials
}));
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(session({
	secret: process.env.SESSION_SECRET,
	cookie: { 
		maxAge: 3 * 30 * 24 * 60 * 60 * 1000,
		secure: false,
		httpOnly: true, // helps protect against XSS attacks
    	sameSite: 'lax' // helps prevent CSRF attacks, adjust if necessary
	},
	saveUninitialized: true,
	store: store,
	resave: false
	
}));

// # Save attendance
app.post('/saveAttendance', hardwareMiddleware, saveAttendance);

// # Teacher login
app.post('/teacher/login', teacherLogin);

// # Teacher login-session-get
app.get('/teacher/login', loginMiddleware);

// # Create lecture-session
app.post('/teacher/lecture/create', sessionCheckerMiddleware, createLecture);

// # Lecture report
app.post('/teacher/lecture/report', sessionCheckerMiddleware, lectureReport);

// # Lecture status
app.post('/student/studentAttendanceReport', studentAttendanceReport);




// # Test route
app.post('/test', hardwareMiddleware, async (req, res) => {
	const { uid } = req.body;
	const formattedDate = format(new Date(Date.now()), 'dd-MM-yyyy HH:mm:ss');
	console.log(`[${formattedDate}][test]: recieved request for UID: ${uid}`);
	res.status(200).send(`[${formattedDate}][test]: recieved request for UID: ${uid}`);
});

// # Server running
app.get('/', (_, res) => res.json({success: true, message: 'Server is running.', uptime: process.uptime()}));

app.listen(port, () => console.log(`Server is listening on http://localhost:${port}`));

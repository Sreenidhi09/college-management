const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// Database simulation (in a real app, use MongoDB, MySQL, etc.)
const users = {
    student: [
        { id: 1, username: 'student1', password: '$2b$10$XWpXCLO8u5Ep4pZq1Xtfkug1h71xFHO/JMeMatKk.5oPdVZ7.Xhd2', name: 'John Smith' }, // password: student123
        { id: 2, username: 'student2', password: '$2b$10$XWpXCLO8u5Ep4pZq1Xtfkug1h71xFHO/JMeMatKk.5oPdVZ7.Xhd2', name: 'Jane Student' }  // password: student123
    ],
    admin: [
        { id: 1, username: 'admin1', password: '$2b$10$4JVzMvvr5yCUJNoTT1CIGepXKxZ1FpW6y4L3N6oXNm2OVPrfBTGTK', name: 'Admin User' } // password: admin123
    ],
    placement: [
        { id: 1, username: 'placement1', password: '$2b$10$oM2T1E4RUPeUkqhdXo.z7O94JJgvIJDkH6kI7VZLixTk841L/V0.i', name: 'Dr. Johnson' } // password: placement123
    ]
};

// Mock data for student dashboard
const studentData = {
    1: {
        profile: {
            personal: {
                fullName: 'John Smith',
                email: 'john.smith@university.edu',
                phone: '(555) 123-4567',
                address: '123 Campus Drive, University City, ST 12345',
                profileImage: '/images/profile.jpg'
            },
            academic: {
                studentId: 'STU123456',
                program: 'Computer Science',
                year: '3', // Junior
                gpa: '3.7',
                graduation: '2026-05'
            },
            resume: {
                skills: 'JavaScript, Python, React, Node.js, SQL, Data Analysis, Project Management',
                experience: 'Web Developer Intern - Tech Company (Summer 2023)\nResearch Assistant - University Research Lab (2022-Present)',
                projects: 'E-commerce Website - Created with React and Node.js\nMachine Learning Model - Predictive Analysis using Python',
                resumeFile: 'JohnSmith_Resume.pdf'
            }
        },
        applications: [
            {
                id: 1,
                company: 'Computer Science Department',
                title: 'Teaching Assistant - Data Structures',
                type: 'On-campus',
                date: 'April 2, 2025',
                status: 'Under Review'
            },
            {
                id: 2,
                company: 'TechSolutions Inc.',
                title: 'Junior Software Developer',
                type: 'Off-campus',
                date: 'March 25, 2025',
                status: 'Accepted',
                details: {
                    startDate: 'May 15, 2025',
                    orientation: 'May 12, 2025 at 10:00 AM',
                    location: 'Main Office, Room 302',
                    responseDeadline: 'April 30th'
                }
            },
            {
                id: 3,
                company: 'Google',
                title: 'Software Engineering Intern',
                type: 'Internship',
                date: 'February 10, 2025',
                status: 'Rejected',
                feedback: 'Thank you for your interest in our position. While your application was strong, we had many qualified candidates and have decided to move forward with candidates whose experience better aligns with our current needs. We encourage you to apply for future positions that match your skills.'
            },
            {
                id: 4,
                company: 'Student Affairs',
                title: 'Student Ambassador',
                type: 'On-campus',
                date: 'April 10, 2025',
                status: 'Applied'
            }
        ],
        courses: [
            { id: 1, code: 'CS401', name: 'Advanced Algorithms', professor: 'Prof. Sarah Johnson', status: 'In Progress' },
            { id: 2, code: 'CS355', name: 'Database Systems', professor: 'Prof. Michael Chen', status: 'In Progress' },
            { id: 3, code: 'MATH301', name: 'Linear Algebra', professor: 'Prof. Robert Davis', status: 'In Progress' },
            { id: 4, code: 'ENG210', name: 'Technical Writing', professor: 'Prof. Emily Wilson', status: 'In Progress' }
        ],
        notifications: [
            { id: 1, message: 'Your application for "Teaching Assistant" has been moved to "Under Review"', date: 'April 15, 2025', read: false },
            { id: 2, message: 'New internship opportunity matches your profile', date: 'April 14, 2025', read: false },
            { id: 3, message: 'Deadline reminder: 2 applications closing this week', date: 'April 13, 2025', read: false }
        ]
    },
    2: {
        profile: {
            personal: {
                fullName: 'Jane Student',
                email: 'jane.student@university.edu',
                phone: '(555) 987-6543',
                address: '456 Campus Drive, University City, ST 12345',
                profileImage: '/images/profile2.jpg'
            },
            academic: {
                studentId: 'STU654321',
                program: 'Business Administration',
                year: '4', // Senior
                gpa: '3.8',
                graduation: '2025-05'
            },
            resume: {
                skills: 'Project Management, Marketing, Data Analysis, Communication',
                experience: 'Marketing Intern - Business Corp (Summer 2023)\nAdministrative Assistant - University Office (2022-Present)',
                projects: 'Marketing Campaign - Designed for local business\nData Analysis Dashboard - Created with Tableau',
                resumeFile: 'JaneStudent_Resume.pdf'
            }
        },
        applications: [],
        courses: [],
        notifications: []
    }
};

// Mock data for opportunities
const opportunities = {
    onCampus: [
        {
            id: 1,
            company: 'Computer Science Department',
            title: 'Research Assistant - AI Lab',
            type: 'On-campus',
            description: 'Looking for undergraduate students to assist with research in artificial intelligence and machine learning projects. 10-15 hours per week.',
            location: 'Science Building, Room 302',
            payRate: '$18/hour',
            deadline: 'May 15, 2025'
        },
        {
            id: 2,
            company: 'Library',
            title: 'Student Library Assistant',
            type: 'On-campus',
            description: 'Help with circulation desk duties, shelving books, and providing basic research assistance to library visitors.',
            location: 'Main Library',
            payRate: '$15/hour',
            deadline: 'April 30, 2025'
        },
        {
            id: 3,
            company: 'Student Affairs',
            title: 'Student Ambassador',
            type: 'On-campus',
            description: 'Represent the university at events, give campus tours, and assist with student orientation programs.',
            location: 'Student Center',
            payRate: '$16/hour',
            deadline: 'May 20, 2025'
        }
    ],
    offCampus: [
        {
            id: 4,
            company: 'TechSolutions Inc.',
            title: 'Junior Software Developer',
            type: 'Off-campus',
            description: 'Seeking students with programming experience to work on web development projects. Flexible hours available.',
            location: 'Downtown Tech District (3 miles from campus)',
            payRate: '$22/hour',
            deadline: 'April 25, 2025'
        },
        {
            id: 5,
            company: 'Data Analytics Corp',
            title: 'Data Analyst Assistant',
            type: 'Off-campus',
            description: 'Part-time position helping with data collection, analysis, and visualization for business clients.',
            location: 'Remote (1 day per week in office)',
            payRate: '$20/hour',
            deadline: 'May 10, 2025'
        }
    ],
    internships: [
        {
            id: 6,
            company: 'Google',
            title: 'Software Engineering Intern',
            type: 'Internship',
            description: 'Summer internship program for computer science students interested in developing innovative technologies.',
            location: 'Mountain View, CA (Remote options available)',
            duration: '12 weeks (Summer 2025)',
            deadline: 'October 15, 2025'
        },
        {
            id: 7,
            company: 'Local Hospital',
            title: 'Healthcare Administration Intern',
            type: 'Internship',
            description: 'Gain hands-on experience in healthcare administration, operations, and patient services.',
            location: 'University Medical Center',
            duration: 'Fall Semester 2025',
            deadline: 'June 30, 2025'
        },
        {
            id: 8,
            company: 'Finance Partners',
            title: 'Financial Analyst Intern',
            type: 'Internship',
            description: 'Work with financial advisors to analyze market trends and prepare reports for clients.',
            location: 'Downtown Financial District',
            duration: 'Spring Semester 2025 (Part-time)',
            deadline: 'December 15, 2024'
        }
    ]
};

// Mock data for admin dashboard
const companies = [
    { id: 'C001', name: 'Tech Innovations Inc.', industry: 'Technology', location: 'San Francisco, CA', contactPerson: 'Sarah Miller', contactEmail: 'sarah@techinnovations.com', contactPhone: '(555) 123-4567', status: 'Active' },
    { id: 'C002', name: 'Global Finance Group', industry: 'Finance', location: 'New York, NY', contactPerson: 'Robert Brown', contactEmail: 'robert@globalfinance.com', contactPhone: '(555) 234-5678', status: 'Active' },
    { id: 'C003', name: 'MediHealth Solutions', industry: 'Healthcare', location: 'Boston, MA', contactPerson: 'Jennifer Lee', contactEmail: 'jennifer@medihealth.com', contactPhone: '(555) 345-6789', status: 'Active' },
    { id: 'C004', name: 'EduTech Systems', industry: 'Education', location: 'Austin, TX', contactPerson: 'David Wilson', contactEmail: 'david@edutech.com', contactPhone: '(555) 456-7890', status: 'Pending' },
    { id: 'C005', name: 'Industrial Manufacturing Co.', industry: 'Manufacturing', location: 'Detroit, MI', contactPerson: 'Thomas Clark', contactEmail: 'thomas@industrialmfg.com', contactPhone: '(555) 567-8901', status: 'Active' }
];

const jobs = [
    { id: 'J001', title: 'Software Developer', companyId: 'C001', company: 'Tech Innovations Inc.', type: 'Full-time', location: 'San Francisco, CA', description: 'Develop web applications', requirements: 'JavaScript, Python', salary: '$80,000-$100,000', deadline: '2025-05-15', status: 'Active' },
    { id: 'J002', title: 'Financial Analyst', companyId: 'C002', company: 'Global Finance Group', type: 'Full-time', location: 'New York, NY', description: 'Analyze financial data', requirements: 'Excel, SQL', salary: '$70,000-$90,000', deadline: '2025-05-10', status: 'Active' },
    { id: 'J003', title: 'Data Scientist', companyId: 'C001', company: 'Tech Innovations Inc.', type: 'Full-time', location: 'San Francisco, CA', description: 'Build ML models', requirements: 'Python, R', salary: '$90,000-$110,000', deadline: '2025-05-20', status: 'Active' },
    { id: 'J004', title: 'UI/UX Designer', companyId: 'C004', company: 'EduTech Systems', type: 'Internship', location: 'Remote', description: 'Design user interfaces', requirements: 'Figma, Adobe XD', salary: '$20/hour', deadline: '2025-04-30', status: 'Active' },
    { id: 'J005', title: 'Project Manager', companyId: 'C005', company: 'Industrial Manufacturing Co.', type: 'Contract', location: 'Detroit, MI', description: 'Manage projects', requirements: 'PMP, Agile', salary: '$85,000-$95,000', deadline: '2025-05-05', status: 'Active' }
];

const placements = [
    { id: 'P001', studentId: 1, student: 'John Smith', companyId: 'C001', company: 'Tech Innovations Inc.', position: 'Junior Developer', startDate: '2025-06-15', salary: '$85,000/year', status: 'Confirmed', notes: '' },
    { id: 'P002', studentId: 2, student: 'Jane Student', companyId: 'C002', company: 'Global Finance Group', position: 'Finance Associate', startDate: '2025-07-01', salary: '$78,000/year', status: 'Confirmed', notes: '' }
];

const eligibilityCriteria = [
    { id: 'E001', jobId: 'J001', job: 'Software Developer - Tech Innovations Inc.', minGPA: 3.0, skills: 'Java, Python, JavaScript', programs: 'Computer Science, Information Technology', yearRestriction: 'Final Year Only' },
    { id: 'E002', jobId: 'J002', job: 'Financial Analyst - Global Finance Group', minGPA: 3.2, skills: 'Excel, SQL, Financial Modeling', programs: 'Finance, Business Administration', yearRestriction: 'Final Year Only' }
];

const settings = {
    systemName: 'University Placement Portal',
    academicYear: '2024-2025',
    placementSeason: 'Summer',
    emailNotifications: 'all'
};

// New mock data for placement dashboard
const placementData = {
    overview: {
        activeRecruitments: 12,
        placementRate: '78%',
        eligibleStudents: 324,
        partnerCompanies: 56
    },
    upcomingDrives: [
        { id: 1, company: 'Accenture', title: 'Software Engineer', date: 'Apr 25, 2025', eligibility: 'CS, IT (7.5+ CGPA)', status: 'Active' },
        { id: 2, company: 'IBM', title: 'Data Analyst', date: 'Apr 28, 2025', eligibility: 'CS, IT, Math (7.0+ CGPA)', status: 'Pending' },
        { id: 3, company: 'TCS', title: 'Systems Engineer', date: 'May 3, 2025', eligibility: 'All Engineering (6.5+ CGPA)', status: 'Active' },
        { id: 4, company: 'Goldman Sachs', title: 'Financial Analyst', date: 'May 10, 2025', eligibility: 'CS, Finance (8.0+ CGPA)', status: 'Pending' }
    ],
    recentPlacements: [
        { id: 1, student: 'Aisha Patel', department: 'Computer Science', company: 'Microsoft', position: 'Software Developer', package: '18.5' },
        { id: 2, student: 'Raj Kumar', department: 'Electrical Engineering', company: 'Samsung', position: 'Hardware Engineer', package: '12.2' },
        { id: 3, student: 'Lisa Chen', department: 'Computer Science', company: 'Amazon', position: 'SDE-1', package: '22.0' },
        { id: 4, student: 'Michael Rodriguez', department: 'Mechanical Engineering', company: 'Tesla', position: 'Design Engineer', package: '15.8' }
    ],
    analytics: {
        departmentData: {
            labels: ['Computer Science', 'Business Admin', 'Engineering', 'Finance', 'Information Tech'],
            data: [28, 15, 22, 17, 20]
        },
        monthlyData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [5, 8, 12, 15, 20, 25]
        },
        salaryData: {
            labels: ['<60k', '60-70k', '70-80k', '80-90k', '90-100k', '100k+'],
            data: [5, 12, 18, 25, 15, 8]
        },
        industryData: {
            labels: ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Other'],
            data: [35, 20, 15, 10, 12, 8]
        }
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication endpoint
app.post('/api/auth', async (req, res) => {
    const { username, password, role } = req.body;
    
    if (!['student', 'admin', 'placement'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }
    
    const user = users[role].find(u => u.username === username);
    
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    try {
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        
        req.session.user = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: role
        };
        
        return res.json({
            success: true,
            message: 'Authentication successful',
            redirect: `/${role}/dashboard`
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Protected routes for each role
app.get('/student/dashboard', checkAuth('student'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student', 'dashboard.html'));
});

app.get('/admin/dashboard', checkAuth('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

app.get('/placement/dashboard', checkAuth('placement'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placement', 'dashboard.html'));
});

// Student dashboard API endpoints
app.get('/api/student/profile', checkAuth('student'), (req, res) => {
    const userId = req.session.user.id;
    const profile = studentData[userId]?.profile;
    
    if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.json({ success: true, profile });
});

app.put('/api/student/profile/:section', checkAuth('student'), (req, res) => {
    const userId = req.session.user.id;
    const { section } = req.params;
    const data = req.body;
    
    if (!['personal', 'academic', 'resume'].includes(section)) {
        return res.status(400).json({ success: false, message: 'Invalid section' });
    }
    
    if (!studentData[userId]) {
        return res.status(404).json({ success: false, message: 'Student data not found' });
    }
    
    studentData[userId].profile[section] = { ...studentData[userId].profile[section], ...data };
    
    res.json({ success: true, message: 'Profile updated successfully' });
});

app.get('/api/student/applications', checkAuth('student'), (req, res) => {
    const userId = req.session.user.id;
    const applications = studentData[userId]?.applications;
    
    if (!applications) {
        return res.status(404).json({ success: false, message: 'Applications not found' });
    }
    
    res.json({ success: true, applications });
});

app.delete('/api/student/applications/:id', checkAuth('student'), (req, res) => {
    const userId = req.session.user.id;
    const applicationId = parseInt(req.params.id);
    
    if (!studentData[userId]?.applications) {
        return res.status(404).json({ success: false, message: 'Applications not found' });
    }
    
    const applicationIndex = studentData[userId].applications.findIndex(app => app.id === applicationId);
    
    if (applicationIndex === -1) {
        return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    studentData[userId].applications.splice(applicationIndex, 1);
    
    res.json({ success: true, message: 'Application withdrawn successfully' });
});

app.get('/api/student/courses', checkAuth('student'), (req, res) => {
    const userId = req.session.user.id;
    const courses = studentData[userId]?.courses;
    
    if (!courses) {
        return res.status(404).json({ success: false, message: 'Courses not found' });
    }
    
    res.json({ success: true, courses });
});

app.get('/api/opportunities/:type', checkAuth('student'), (req, res) => {
    const { type } = req.params;
    
    if (!['onCampus', 'offCampus', 'internships'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid opportunity type' });
    }
    
    res.json({ success: true, opportunities: opportunities[type] });
});

app.post('/api/applications', checkAuth('student'), (req, res) => {
    const userId = req.session.user.id;
    const { opportunityId } = req.body;
    
    if (!opportunityId) {
        return res.status(400).json({ success: false, message: 'Opportunity ID is required' });
    }
    
    let opportunity = null;
    for (const type of ['onCampus', 'offCampus', 'internships']) {
        const found = opportunities[type].find(opp => opp.id === parseInt(opportunityId));
        if (found) {
            opportunity = found;
            break;
        }
    }
    
    if (!opportunity) {
        return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    
    const alreadyApplied = studentData[userId].applications.some(
        app => app.title === opportunity.title && app.company === opportunity.company
    );
    
    if (alreadyApplied) {
        return res.status(400).json({ success: false, message: 'You have already applied for this opportunity' });
    }
    
    const newApplication = {
        id: Date.now(),
        company: opportunity.company,
        title: opportunity.title,
        type: opportunity.type,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: 'Applied'
    };
    
    studentData[userId].applications.push(newApplication);
    
    res.json({ success: true, message: 'Application submitted successfully', application: newApplication });
});

app.get('/api/student/notifications', checkAuth('student'), (req, res) => {
    const userId = req.session.user.id;
    const notifications = studentData[userId]?.notifications;
    
    if (!notifications) {
        return res.status(404).json({ success: false, message: 'Notifications not found' });
    }
    
    res.json({ success: true, notifications, unreadCount: notifications.filter(n => !n.read).length });
});

app.put('/api/student/notifications/read', checkAuth('student'), (req, res) => {
    const userId = req.session.user.id;
    
    if (!studentData[userId]?.notifications) {
        return res.status(404).json({ success: false, message: 'Notifications not found' });
    }
    
    studentData[userId].notifications.forEach(notification => {
        notification.read = true;
    });
    
    res.json({ success: true, message: 'All notifications marked as read' });
});

// Admin dashboard API endpoints
app.get('/api/admin/dashboard', checkAuth('admin'), (req, res) => {
    const totalStudents = users.student.length;
    const totalCompanies = companies.length;
    const totalJobs = jobs.length;
    const placementRate = ((placements.length / totalStudents) * 100).toFixed(1) + '%';
    const recentApplications = studentData[1]?.applications.slice(0, 5) || [];

    res.json({
        success: true,
        data: {
            totalStudents,
            totalCompanies,
            totalJobs,
            placementRate,
            recentApplications
        }
    });
});

app.get('/api/admin/companies', checkAuth('admin'), (req, res) => {
    res.json({ success: true, companies });
});

app.post('/api/admin/companies', checkAuth('admin'), (req, res) => {
    const { id, name, industry, location, contactPerson, contactEmail, contactPhone, status } = req.body;
    
    if (!name || !industry || !location || !contactPerson || !contactEmail || !contactPhone || !status) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (id) {
        const index = companies.findIndex(c => c.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        companies[index] = { id, name, industry, location, contactPerson, contactEmail, contactPhone, status };
    } else {
        const newCompany = {
            id: `C${String(companies.length + 1).padStart(3, '0')}`,
            name,
            industry,
            location,
            contactPerson,
            contactEmail,
            contactPhone,
            status
        };
        companies.push(newCompany);
    }

    res.json({ success: true, message: id ? 'Company updated successfully' : 'Company added successfully' });
});

app.delete('/api/admin/companies/:id', checkAuth('admin'), (req, res) => {
    const { id } = req.params;
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Company not found' });
    }
    companies.splice(index, 1);
    res.json({ success: true, message: 'Company deleted successfully' });
});

app.get('/api/admin/jobs', checkAuth('admin'), (req, res) => {
    res.json({ success: true, jobs });
});

app.post('/api/admin/jobs', checkAuth('admin'), (req, res) => {
    const { id, title, companyId, type, location, description, requirements, salary, deadline, status } = req.body;
    
    if (!title || !companyId || !type || !location || !description || !requirements || !deadline || !status) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const company = companies.find(c => c.id === companyId);
    if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (id) {
        const index = jobs.findIndex(j => j.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        jobs[index] = { id, title, companyId, company: company.name, type, location, description, requirements, salary, deadline, status };
    } else {
        const newJob = {
            id: `J${String(jobs.length + 1).padStart(3, '0')}`,
            title,
            companyId,
            company: company.name,
            type,
            location,
            description,
            requirements,
            salary,
            deadline,
            status
        };
        jobs.push(newJob);
    }

    res.json({ success: true, message: id ? 'Job updated successfully' : 'Job added successfully' });
});

app.delete('/api/admin/jobs/:id', checkAuth('admin'), (req, res) => {
    const { id } = req.params;
    const index = jobs.findIndex(j => j.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    jobs.splice(index, 1);
    res.json({ success: true, message: 'Job deleted successfully' });
});

app.get('/api/admin/students', checkAuth('admin'), (req, res) => {
    const students = users.student.map(user => ({
        id: user.id,
        name: user.name,
        program: studentData[user.id]?.profile.academic.program || 'N/A',
        year: studentData[user.id]?.profile.academic.year || 'N/A',
        gpa: studentData[user.id]?.profile.academic.gpa || 'N/A',
        applications: studentData[user.id]?.applications.length || 0,
        placementStatus: placements.find(p => p.studentId === user.id) ? 'Placed' : 'Not Placed'
    }));
    res.json({ success: true, students });
});

app.get('/api/admin/placements', checkAuth('admin'), (req, res) => {
    res.json({ success: true, placements });
});

app.post('/api/admin/placements', checkAuth('admin'), (req, res) => {
    const { id, studentId, companyId, position, startDate, salary, status, notes } = req.body;
    
    if (!studentId || !companyId || !position || !startDate || !salary || !status) {
        return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const student = users.student.find(s => s.id === parseInt(studentId));
    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const company = companies.find(c => c.id === companyId);
    if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (id) {
        const index = placements.findIndex(p => p.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Placement not found' });
        }
        placements[index] = { 
            id, 
            studentId: parseInt(studentId), 
            student: student.name, 
            companyId, 
            company: company.name, 
            position, 
            startDate, 
            salary, 
            status, 
            notes 
        };
    } else {
        const newPlacement = {
            id: `P${String(placements.length + 1).padStart(3, '0')}`,
            studentId: parseInt(studentId),
            student: student.name,
            companyId,
            company: company.name,
            position,
            startDate,
            salary,
            status,
            notes
        };
        placements.push(newPlacement);
    }

    res.json({ success: true, message: id ? 'Placement updated successfully' : 'Placement added successfully' });
});

app.delete('/api/admin/placements/:id', checkAuth('admin'), (req, res) => {
    const { id } = req.params;
    const index = placements.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Placement not found' });
    }
    placements.splice(index, 1);
    res.json({ success: true, message: 'Placement deleted successfully' });
});

app.get('/api/admin/eligibility', checkAuth('admin'), (req, res) => {
    res.json({ success: true, eligibilityCriteria });
});

app.post('/api/admin/eligibility', checkAuth('admin'), (req, res) => {
    const { id, jobId, minGPA, skills, programs, yearRestriction } = req.body;
    
    if (!jobId || !minGPA || !skills || !programs) {
        return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const job = jobs.find(j => j.id === jobId);
    if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (id) {
        const index = eligibilityCriteria.findIndex(e => e.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Eligibility criteria not found' });
        }
        eligibilityCriteria[index] = { 
            id, 
            jobId, 
            job: `${job.title} - ${job.company}`,
            minGPA, 
            skills, 
            programs, 
            yearRestriction 
        };
    } else {
        const newCriteria = {
            id: `E${String(eligibilityCriteria.length + 1).padStart(3, '0')}`,
            jobId,
            job: `${job.title} - ${job.company}`,
            minGPA,
            skills,
            programs,
            yearRestriction
        };
        eligibilityCriteria.push(newCriteria);
    }

    res.json({ success: true, message: id ? 'Eligibility criteria updated successfully' : 'Eligibility criteria added successfully' });
});

app.delete('/api/admin/eligibility/:id', checkAuth('admin'), (req, res) => {
    const { id } = req.params;
    const index = eligibilityCriteria.findIndex(e => e.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Eligibility criteria not found' });
    }
    eligibilityCriteria.splice(index, 1);
    res.json({ success: true, message: 'Eligibility criteria deleted successfully' });
});

app.get('/api/admin/settings', checkAuth('admin'), (req, res) => {
    res.json({ success: true, settings });
});

app.put('/api/admin/settings', checkAuth('admin'), (req, res) => {
    const { systemName, academicYear, placementSeason, emailNotifications } = req.body;
    
    if (!systemName || !academicYear || !placementSeason || !emailNotifications) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    settings.systemName = systemName;
    settings.academicYear = academicYear;
    settings.placementSeason = placementSeason;
    settings.emailNotifications = emailNotifications;

    res.json({ success: true, message: 'Settings updated successfully' });
});

// Placement officer dashboard API endpoints
app.get('/api/placement/dashboard', checkAuth('placement'), (req, res) => {
    res.json({ success: true, data: placementData });
});

app.get('/api/placement/drives', checkAuth('placement'), (req, res) => {
    res.json({ success: true, drives: placementData.upcomingDrives });
});

app.post('/api/placement/drives', checkAuth('placement'), (req, res) => {
    const { id, company, title, date, eligibility, status } = req.body;
    
    if (!company || !title || !date || !eligibility) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (id) {
        const index = placementData.upcomingDrives.findIndex(d => d.id === parseInt(id));
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Drive not found' });
        }
        placementData.upcomingDrives[index] = { id: parseInt(id), company, title, date, eligibility, status };
    } else {
        const newDrive = {
            id: placementData.upcomingDrives.length + 1,
            company,
            title,
            date,
            eligibility,
            status: status || 'Pending'
        };
        placementData.upcomingDrives.push(newDrive);
    }

    res.json({ success: true, message: id ? 'Drive updated successfully' : 'Drive added successfully' });
});

app.delete('/api/placement/drives/:id', checkAuth('placement'), (req, res) => {
    const { id } = req.params;
    const index = placementData.upcomingDrives.findIndex(d => d.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    placementData.upcomingDrives.splice(index, 1);
    res.json({ success: true, message: 'Drive deleted successfully' });
});

app.get('/api/placement/students', checkAuth('placement'), (req, res) => {
    const students = users.student.map(user => ({
        id: user.id,
        name: user.name,
        program: studentData[user.id]?.profile.academic.program || 'N/A',
        year: studentData[user.id]?.profile.academic.year || 'N/A',
        gpa: studentData[user.id]?.profile.academic.gpa || 'N/A',
        skills: studentData[user.id]?.profile.resume.skills || 'N/A',
        placementStatus: placements.find(p => p.studentId === user.id) ? 'Placed' : 'Not Placed'
    }));
    res.json({ success: true, students });
});

app.get('/api/placement/companies', checkAuth('placement'), (req, res) => {
    res.json({ success: true, companies });
});

app.get('/api/placement/analytics', checkAuth('placement'), (req, res) => {
    res.json({ success: true, analytics: placementData.analytics });
});

// Utility function to check authentication for specific roles
function checkAuth(role) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).redirect('/login.html');
        }
        
        if (req.session.user.role !== role) {
            return res.status(403).redirect('/unauthorized.html');
        }
        
        next();
    };
}

// Logout endpoint
app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to logout' });
        }
        res.json({ success: true, message: 'Logged out successfully', redirect: '/' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
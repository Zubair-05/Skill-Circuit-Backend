const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middlewares/authenticateToken');

// Course Management (Instructor)
router.get('/courses', courseController.getCourses);
router.post('/courses/create', authenticateToken, courseController.createCourse);
// router.get('/courses/:courseId', courseController.getCourseDetails);
// router.put('/courses/:courseId/update', authenticateToken, courseController.updateCourse);
// router.delete('/courses/:courseId/delete', authenticateToken, courseController.deleteCourse);
// router.get('/instructor/courses', authenticateToken, courseController.getInstructorCourses);
//
// // Course Enrollment (Student)
// router.post('/courses/:courseId/enroll', authenticateToken, courseController.enrollInCourse);
// router.get('/enrollments', authenticateToken, courseController.getStudentEnrollments);
//
// // Course Progress (Optional)
// router.get('/courses/:courseId/progress', authenticateToken, courseController.getCourseProgress);

module.exports = router;

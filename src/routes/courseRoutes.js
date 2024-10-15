const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middlewares/authenticateToken');

// Course Management (Instructor)
router.get('/courses/instructor/:userId', authenticateToken, courseController.getInstructorCourses);
router.get('/course', authenticateToken, courseController.getCourseDetails);
router.post('/courses/create', authenticateToken, courseController.createCourse);
router.put('/courses/:courseId/update', authenticateToken, courseController.updateCourse);


router.get('/chapter/:chapterId', authenticateToken, courseController.getChapterDetails);
router.post('/course/chapter/create', authenticateToken, courseController.createChapter);
router.post('/course/chapter/add/content', authenticateToken, courseController.updateChapter);
router.delete('/course/chapter/delete/:id', authenticateToken, courseController.deleteChapter);

//Student side
router.get('/courses',authenticateToken, courseController.getAllPublishedCourses);
router.get('/courses/:courseId',authenticateToken, courseController.getCourseOverview);
router.get('/course/purchased', authenticateToken, courseController.getPurchasedCourses);
router.get('/course/content/:courseId', authenticateToken, courseController.getCourseContent);


// Course Enrollment (Student)
// router.post('/courses/:courseId/enroll', authenticateToken, courseController.enrollInCourse);
// router.get('/enrollments', authenticateToken, courseController.getStudentEnrollments);

// // Course Progress (Optional)
// router.get('/courses/:courseId/progress', authenticateToken, courseController.getCourseProgress);

module.exports = router;

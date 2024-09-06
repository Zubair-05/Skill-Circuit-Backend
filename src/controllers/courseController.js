const courses = require('../data');

const getCourses = (req, res) => {
    console.log('Request has been made to fetch courses');
    res.status(200).json({ success: true, courses });
};

const createCourse = (req, res) => {
    console.log('Request has been made to create course');
    res.status(201).json({ success: true, course: req.user });
}
// Export all functions at once
module.exports = {
    getCourses,
    createCourse,
};

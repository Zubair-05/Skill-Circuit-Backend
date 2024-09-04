const courses = require('../data');

const getCourses = (req, res) => {
    console.log('Request has been made to fetch courses');
    res.status(200).json({ success: true, courses });
};

// Export all functions at once
module.exports = {
    getCourses
};

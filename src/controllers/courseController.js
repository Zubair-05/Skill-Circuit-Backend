const {Course} = require('../models/course');
const {Module} = require("../models/course");
const Enrollment = require('../models/enrollment');

// const getCourses = (req, res) => {
//     console.log('Request has been made to fetch courses');
//     res.status(200).json({success: true, courses});
// };
const getInstructorCourses = async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch all courses where the user is the instructor
        const courses = await Course.find({ teacher: userId });
        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: "No courses found for this instructor" });
        }

        res.status(200).json({ courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }

}

const createCourse = async (req, res) => {

    try {
        // const teacher = await User.findById(req.user.id);
        const newCourse = new Course({teacher: req.user.id});
        const savedCourse = await newCourse.save();

        return res.status(201).json({courseId: savedCourse._id, userId: savedCourse.teacher});
    } catch (error) {
        console.error('Error creating course:', error);
        return res.status(500).json({error: 'An error occurred while creating the course.'});
    }
}

const updateCourse = async (req, res) => {
    console.log(req.body);
    const {courseId, title, description, category, price, imageUrl, isPublished} = req.body.course;
    try {
        const course = await Course.findByIdAndUpdate({
            _id: courseId,
        }, {
            title,
            description,
            category,
            price,
            thumbnail: imageUrl,
            isPublished
        })

        return res.status(200).json({success: true, course});
    } catch (error) {
        console.error('Error updating course:', error);
        return res.status(500).json({error: 'An error occurred while creating the course.'});
    }
}



const createChapter = async (req, res) => {
    try {
        console.log(`got a request for course creation`)
        const newChapter = new Module({course: req.body.courseId});
        const savedChapter = await newChapter.save();
        return res.status(201).json({message: 'Chapter added', chapter: savedChapter.id});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'An error occurred while adding new chapter to the course.'});
    }
}

const updateChapter = async (req, res) => {
    try {
        const {chapterId, title, description, isFree, videoUrl} = req.body.chapter;
        console.log(`chapter body is `, req.body.chapter);
        // Find the chapter by id and update the fields
        const updatedChapter = await Module.findByIdAndUpdate(
            chapterId,
            {
                title,
                description,
                isFree,
                videoUrl
            },
            {new: true}
        );
        console.log(`updated chapter is`, updatedChapter);
        if (!updatedChapter) {
            return res.status(404).json({message: 'Chapter not found'});
        }
        const updatedCourse = await Course.findByIdAndUpdate(
            updatedChapter.course,
            {
                $addToSet: {modules: chapterId}
            },
            {new: true}
        )
        console.log(`updated course is`, updatedCourse);
        if (!updatedChapter) {
            return res.status(404).json({message: 'Course not found'});
        }

        return res.status(200).json({message: 'Chapter updated successfully', updatedChapter});
    } catch (error) {
        console.error('Error updating chapter:', error);
        return res.status(500).json({message: 'Server error'});
    }
}

const getCourseDetails = async (req, res) => {
    const {id} = req.query
    if (!id) {
        return res.status(400).json({message: 'Course ID is required'});
    }
    try {
        const course = await Course.findById(id)
            .select('id title description price category thumbnail isPublished modules')
            .populate({
                path: 'modules',
                select: 'id title isFree'
            })
        console.log(course);
        const baseUrl = process.env.S3_BASE_URL;
        const thumbnail = `${baseUrl}${course.thumbnail}`
        return res.status(200).json({
            message: `course fetched successfully`,
            course: {
                ...course.toObject(),
                thumbnail: thumbnail,
            }
        })
    } catch (e) {
        return res.status(500).json({message: 'Server error'});
    }
}

const getChapterDetails = async (req, res) => {
    const {chapterId} = req.params;
    try{
        const chapter = await Module.findById({
            _id : chapterId
        })
        const videoUrl = chapter.videoUrl ? `${process.env.S3_BASE_URL}${chapter.videoUrl}` : null;
        return res.status(200).json({chapter:{
            ...chapter.toObject(),
                videoUrl : videoUrl
            }})
    } catch (e) {
        console.log(`error fetching chapter details`, e);
        return res.status(500).json({message:'server error'})
    }
}
const deleteChapter = async (req, res) => {
    const chapterId = req.params.id;
    try {
        const chapter = await Module.findByIdAndDelete(chapterId);
        return res.status(200).json({message: 'Chapter deleted successfully'});
    } catch (e) {
        console.error('Error deleting chapter', e);
        return res.status(500).json({message: 'server error'});
    }
}

// from the view of student

const getAllPublishedCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .select('title price thumbnail isPublished teacher') // Select required fields from Course schema
            .populate({
                path: 'teacher',
                select: 'name profilePicture', // Populate only the name and profilePicture fields from User schema
            });

        if (!courses) {
            return res.status(404).json({ message: 'No courses found' });
        }

        return res.status(200).json({
            message: 'Courses fetched successfully',
            courses: courses.map(course => ({
                id : course._id,
                title: course.title,
                price: course.price,
                thumbnail: `${process.env.S3_BASE_URL}${course.thumbnail}`, // Generate the full URL for the thumbnail
                teacher: {
                    name: course.teacher.name,
                    profilePicture: course.teacher.profilePicture,
                },
            })),
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
};

const getCourseOverview = async (req, res) => {
    const { courseId } = req.params;  // Extract courseId from path parameters
    const userId = req.user.id;
    if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
    }

    try {
        const course = await Course.findById(courseId)
            .select('id title description price category thumbnail prerequisites thingsToLearn teacher modules isPublished publishedAt')
            .populate({
                path: 'teacher',
                select: 'name profilePicture email',
            })
            .populate({
                path: 'modules',
                select: 'id title description isFree',
            });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const enrollment = await Enrollment.findOne({
            student: userId,
            course:courseId
        })
        let isEnrolled = true;
        if(!enrollment) isEnrolled = false;
        // Generate the full S3 URL for the thumbnail
        const baseUrl = process.env.S3_BASE_URL;
        const thumbnail = `${baseUrl}${course.thumbnail}`;

        return res.status(200).json({
            message: 'Course fetched successfully',
            course: {
                id: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                category: course.category,
                prerequisites: course.prerequisites,
                thingsToLearn: course.thingsToLearn,
                thumbnail: thumbnail,
                teacher: {
                    id: course.teacher._id,
                    name: course.teacher.name,
                    profilePicture: course.teacher.profilePicture,
                    email: course.teacher.email,
                },
                modules: course.modules.map(module => ({
                    id: module._id,
                    title: module.title,
                    description: module.description,
                    isFree: module.isFree,
                })),
                isPublished: course.isPublished,
                publishedAt: course.publishedAt,
            },
            isEnrolled: isEnrolled
        });
    } catch (e) {
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
};

const getPurchasedCourses = async (req, res) => {
    const userId = req.user.id;
    try{
        const enrollments = await Enrollment.find({ student: userId })
            .populate('course') // This will populate the course details from the Course model
            .exec();

        // Extract the courses from the populated enrollments
        const courses = enrollments.map(enrollment => enrollment.course);

        if (!courses) {
            return res.status(404).json({ message: 'No courses found' });
        }

        return res.status(200).json({
            message: 'Courses fetched successfully',
            courses: courses.map(course => ({
                id : course._id,
                title: course.title,
                price: course.price,
                thumbnail: `${process.env.S3_BASE_URL}${course.thumbnail}`, // Generate the full URL for the thumbnail
                teacher: {
                    name: course.teacher.name,
                    profilePicture: course.teacher.profilePicture,
                },
            })),
        });
    } catch (err){
        console.log(err);
        return res.status(500).json({message:"Server error", error:err.message});
    }
}

const getCourseContent = async (req, res) => {
    const { courseId } = req.params;

    try {
        // Find the course by its ID and populate the modules
        const course = await Course.findById(courseId)
            .populate({
                path: 'modules', // Populate modules
                select: 'title videoUrl' // Only select title and videoUrl from the modules
            });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Base URL from environment variables (e.g., S3 base URL)
        const baseUrl = process.env.S3_BASE_URL;

        // Add base URL to each module's video URL
        const modulesWithVideoUrls = course.modules.map(module => ({
            _id: module._id,
            title: module.title,
            videoUrl: `${baseUrl}${module.videoUrl}` // Append base URL to videoUrl
        }));

        // Return course title and modules with full video URLs
        return res.status(200).json({
            title: course.title,
            modules: modulesWithVideoUrls
        });
    } catch (err) {
        console.error('Error fetching course content:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { getCourseContent };


module.exports = {
    getAllPublishedCourses,
    getCourseOverview,
    getPurchasedCourses,
    getCourseContent,
    getInstructorCourses,
    getCourseDetails,
    createCourse,
    updateCourse,
    getChapterDetails,
    createChapter,
    updateChapter,
    deleteChapter,
};

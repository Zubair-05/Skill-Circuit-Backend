const courses = require('../data');
const {Course} = require('../models/course');
const User = require('../models/user');
const {Module} = require("../models/course");
const {populate} = require("dotenv");

// const getCourses = (req, res) => {
//     console.log('Request has been made to fetch courses');
//     res.status(200).json({success: true, courses});
// };

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
    const {courseId, title, description, category, price, imageUrl, isPublished} = req.body;
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
        console.log(req.body.chapter);
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
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
};

const getCourseOverview = async (req, res) => {
    const { courseId } = req.params;  // Extract courseId from path parameters

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
            }
        });
    } catch (e) {
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
};


module.exports = {
    getAllPublishedCourses,
    getCourseOverview,
    getCourseDetails,
    createCourse,
    updateCourse,
    getChapterDetails,
    createChapter,
    updateChapter,
    deleteChapter,
};

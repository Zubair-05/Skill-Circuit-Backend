const courses = require('../data');
const {Course} = require('../models/Course');
const User = require('../models/User');
const {Module} = require("../models/course");
const {populate} = require("dotenv");
const getCourses = (req, res) => {
    console.log('Request has been made to fetch courses');
    res.status(200).json({ success: true, courses });
};

const createCourse = async (req, res) => {
    const {title} = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    console.log(req.user.id);
    try {
        // const teacher = await User.findById(req.user.id);
        const newCourse = new Course({title, teacher:req.user.id});
        const savedCourse = await newCourse.save();

        return res.status(201).json({ courseId: savedCourse._id, userId: savedCourse.teacher });
    } catch (error) {
        console.error('Error creating course:', error);
        return res.status(500).json({ error: 'An error occurred while creating the course.' });
    }
}

const addNewChapter = async (req, res) => {
    try{
        console.log(`got a request for course creation`)
        const newChapter = new Module({course:req.body.courseId});
        const savedChapter = await newChapter.save();
        return res.status(201).json({message: 'Chapter added', chapter: savedChapter.id});
    } catch (error){
        console.log(error);
        return res.status(500).json({message: 'An error occurred while adding new chapter to the course.'});
    }
}

const addContentInChapter = async (req, res) => {
    try {
        const { chapterId, title, description, isFree, videoUrl } = req.body.chapter;
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
            { new: true }
        );
        console.log(`updated chapter is`, updatedChapter);
        if (!updatedChapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }
        const updatedCourse = await Course.findByIdAndUpdate(
            updatedChapter.course,
            {
                $addToSet:{modules : chapterId}
            },
            { new: true }
        )
        console.log(`updated course is`, updatedCourse);
        if(!updatedChapter) {
            return res.status(404).json({ message: 'Course not found' });
        }

        return res.status(200).json({ message: 'Chapter updated successfully', updatedChapter });
    } catch (error) {
        console.error('Error updating chapter:', error);
        return res.status(500).json({ message: 'Server error' });
    }



}

const getCourseDetails = async (req, res) => {
    const {id} = req.query
    if (!id) {
        return res.status(400).json({ message: 'Course ID is required' });
    }
    try{
        const course = await Course.findById(id)
            .select('id title description price category thumbnail isPublished modules')
            .populate({
            path : 'modules',
            select : 'id title description isFree'
        })
        return res.status(200).json({message : `course fetched successfully`, course})
    } catch (e) {
        return res.status(500).json({message:'Server error'});
    }
}
module.exports = {
    getCourseDetails,
    getCourses,
    createCourse,
    addNewChapter,
    addContentInChapter
};

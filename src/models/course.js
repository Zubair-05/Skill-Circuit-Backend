const mongoose = require("mongoose");
const {mongo} = require("mongoose");
const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    duration: { type: Number }, // Optional: Duration of the lesson in minutes
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true }
});

const moduleSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    isFree : {type: Boolean, default: false},
    // lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    videoUrl : {type: String},
});

const courseSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    price: { type: Number},
    prerequisites: [{ type: String }],
    thingsToLearn : [{ type: String}],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    thumbnail: { type: String},
    publishedAt: { type: Date },
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema) ;
const Module =  mongoose.models.Module || mongoose.model('Module', moduleSchema);
const Lesson =  mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

module.exports = { Course, Module, Lesson };
 // module.exports = Course;

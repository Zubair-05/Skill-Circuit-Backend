const mongoose = require("mongoose");
const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    duration: { type: Number }, // Optional: Duration of the lesson in minutes
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true }
});

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    prerequisites: [{ type: String, required: true }],
    thingsToLearn : [{ type: String, required: true }],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    thumbnail: { type: String, required: true },
    publishedAt: { type: Date },
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);
const Module = mongoose.model('Module', moduleSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = { Course, Module, Lesson };

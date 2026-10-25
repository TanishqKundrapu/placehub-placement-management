const express = require('express');
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { validateStudent, validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.route('/').get(getStudents).post(validateStudent, createStudent);
router.route('/:id').get(validateObjectId, getStudent).put(validateObjectId, validateStudent, updateStudent).delete(validateObjectId, deleteStudent);

module.exports = router;

const express = require('express');
const { getJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { validateJob, validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.route('/').get(getJobs).post(validateJob, createJob);
router.route('/:id').get(validateObjectId, getJob).put(validateObjectId, validateJob, updateJob).delete(validateObjectId, deleteJob);

module.exports = router;

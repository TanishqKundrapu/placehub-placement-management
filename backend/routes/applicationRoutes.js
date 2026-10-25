const express = require('express');
const { getApplications, getApplication, createApplication, updateApplication, deleteApplication } = require('../controllers/applicationController');
const { validateApplication, validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.route('/').get(getApplications).post(validateApplication, createApplication);
router.route('/:id').get(validateObjectId, getApplication).put(validateObjectId, validateApplication, updateApplication).delete(validateObjectId, deleteApplication);

module.exports = router;

const express = require('express');
const { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } = require('../controllers/companyController');
const { validateCompany, validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.route('/').get(getCompanies).post(validateCompany, createCompany);
router.route('/:id').get(validateObjectId, getCompany).put(validateObjectId, validateCompany, updateCompany).delete(validateObjectId, deleteCompany);

module.exports = router;

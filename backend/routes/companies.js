// routes/companies.js
import express from 'express';
import Company from '../models/Company.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
});

router.post('/', async (req, res) => {
  const newCompany = await Company.create(req.body);
  console.log(newCompany)
  res.json(newCompany);
});

router.put('/:id', async (req, res) => {
  const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

export default router;

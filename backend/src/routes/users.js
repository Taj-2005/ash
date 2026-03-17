const express = require('express');
const { 
  getProfile, 
  updateProfile 
} = require('../controllers/userController');

const authenticateToken = require('../middleware/auth').authenticateToken; 

const router = express.Router(); 


router.get(
  '/profile', 
  authenticateToken, 
  getProfile
);

router.put(
  '/profile', 
  authenticateToken, 
  updateProfile
);


module.exports = router;
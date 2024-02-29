const express = require("express");
const router = express.Router();



const {login, signup} = require("../controller/auth");
const {auth, isStudent, isAdmin}=require("../middlewares/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);

// testing protected routes for single middleware
router.get("/testing", auth, (req,res)=>{
    res.json({
        success:true,
        message:"welcome to the protected routes for testing"
    });
});

// protecyed routes

router.get("/student", auth, isStudent, (req,res)=>{
    res.json({
        success:true,
        message:"wlecome to the protected routes for students"
    });
});

router.get("/admin", auth, isAdmin, (req,res)=>{
    res.json({
        success:true,
        message:"wlecome to the protected routes for admin"
    });
});

module.exports = router;
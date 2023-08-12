const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = require('express').Router();
const {successResponse, errorResponse} = require('../utils/functions');

router.post('/register', async (req, res)=>{
    try{
    const {name, email, password} = req.body;
    if(!name || !email || !password) return res.status(400).json(errorResponse('All fields are required'));
        
        const oldUser = await User.findOne({ email: email});
        if(oldUser) return res.status(400).json(errorResponse('Email is already taken'));


        let hashPassword = await bcrypt.hash(password, 10);

        let user = await User.create({name, email, password: hashPassword});
        let token = jwt.sign({id: user._id}, process.env.JWT_ENCRYPTION_KEY);
        user = user.toObject();
        user.token = token;

        return res.status(200).json(successResponse('Registration successfull.',{user}));

    }catch(e){
        return res.status(400).json(errorResponse('Error:'+ e) );
    }
    
});

router.post('/login', async (req, res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password) return res.status(400).json(errorResponse('All fields are required'));
            
            let user = await User.findOne({email: email});

            if( !user || !(await bcrypt.compare(password, user.password)) ){
                return res.status(400).json(errorResponse('Invalid Email or Password')); 
            }

            let token = jwt.sign({id: user._id}, process.env.JWT_ENCRYPTION_KEY);
            user = user.toObject();
            user.token = token;

            return res.status(200).json(successResponse('Login successfull.',{ user:user }));
    
        }catch(e){
            console.log(e);
            return res.status(400).json(errorResponse('something went wrong.') );
        }
});

router.get('/user', async (req, res)=>{
    let token = req.query.token;
    if(!token) return res.status(401).json(errorResponse('Token Not found'));

    try{

        let {id}  = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY);
        let user = await User.findById(id);
        if(!user) return res.status(400).json(errorResponse('User not found'));

        user = user.toObject();
        user.token = token;

        return res.json(successResponse('User fetched', {user}))

    }catch(e){
        return res.status(401).json(errorResponse('Invalid Token'));
    }
});

module.exports = router;

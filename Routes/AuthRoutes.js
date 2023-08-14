const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = require('express').Router();
const authMiddleware = require('../middlewares/auth');
const { successResponse, errorResponse } = require('../utils/functions');
const multer = require('multer')

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json(errorResponse('All fields are required'));

        const oldUser = await User.findOne({ email: email });
        if (oldUser) return res.status(400).json(errorResponse('Email is already taken'));


        let hashPassword = await bcrypt.hash(password, 10);

        let user = await User.create({ name, email, password: hashPassword });
        let token = jwt.sign({ id: user._id }, process.env.JWT_ENCRYPTION_KEY);
        user = user.toObject();
        user.token = token;

        return res.status(200).json(successResponse('Registration successfull.', { user }));

    } catch (e) {
        return res.status(400).json(errorResponse('Error:' + e));
    }

});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json(errorResponse('All fields are required'));

        let user = await User.findOne({ email: email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json(errorResponse('Invalid Email or Password'));
        }

        let token = jwt.sign({ id: user._id }, process.env.JWT_ENCRYPTION_KEY);
        user = user.toObject();
        user.token = token;

        return res.status(200).json(successResponse('Login successfull.', { user: user }));

    } catch (e) {
        console.log(e);
        return res.status(400).json(errorResponse('something went wrong.'));
    }
});

router.get('/user', async (req, res) => {
    let token = req.query.token;
    if (!token) return res.status(401).json(errorResponse('Token Not found'));

    try {

        let { id } = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY);
        let user = await User.findById(id);
        if (!user) return res.status(400).json(errorResponse('User not found'));

        user = user.toObject();
        user.token = token;

        return res.json(successResponse('User fetched', { user }))

    } catch (e) {
        return res.status(401).json(errorResponse('Invalid Token'));
    }
});
router.put('/update', authMiddleware, async (req, res) => {
    let { name } = req.body.token
    if (!name) return res.status(400).json(errorResponse("Email and name fields are required"))
    const data = await User.updateOne(
        { _id: req.user_id },
        { $set: { name: name } }
    )
    return res.json(successResponse('Name Changed Successfully'))

})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })

router.put('/upload-image',authMiddleware, upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json(errorResponse('Please Choose Image'));
    console.log("REQ",req.file)
    const image = req.file.filename
    
    try{
        let userImage = await User.updateOne({ _id: req.user_id },
            { $set: { profileImage: image } });
            return res.json(successResponse('Profile Update Sucessfully',image))

    }catch(error){
        return res.json(errorResponse('Invalid Image'))
    }
})

module.exports = router;

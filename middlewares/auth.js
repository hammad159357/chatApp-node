const {successResponse, errorResponse} = require('../utils/functions');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next)=>{
    const token = req.header('authorization')?.split(' ')?.[1];

    if(!token) return res.status(401).json( errorResponse('Token not found') );
    try{
        const user = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY);
        req.user_id = user.id
        next(); 
    }catch(e){
        console.log(e);
        return res.status(401).json( errorResponse('Unauthorized.') );
    }
}

module.exports = authMiddleware;
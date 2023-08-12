const User = require('../models/user');
const Message = require('../models/message');
const router = require('express').Router();
const {successResponse, errorResponse} = require('../utils/functions');

// By default all registered users are included in contact list
router.get('/contacts',async (req, res)=>{
    try{

        let contacts = await User.find({
            _id: {$ne: req.user_id}
        }).select('_id name');
        let userMessages = await Message.find({
            $or: [ {sender: req.user_id}, {receiver: req.user_id} ]
        }).select('_id text sender receiver createdAt').sort({'_id': -1}).exec()

        contacts = contacts.map((c)=>{
            c = c.toObject();
            c.recentMessage = userMessages.find( m => m.sender.toString()==c._id || m.receiver.toString()==c._id)
            return c;
        })
        
        // Sorting contacts with recent msges
        contacts = contacts.sort((prev, next)=>{
            if(prev.recentMessage && next.recentMessage){
                return (new Date(prev.recentMessage.createdAt)) > (new Date(next.recentMessage.createdAt)) ? -1 : 1;
            }
            return prev.recentMessage ? 1 : next.recentMessage ? 1: 0
        })

        return res.json(successResponse('Contacts fetched successfully.', contacts ));

    }catch(e){
        return res.status(500).json(errorResponse(e?.toString()));
    }
});

// Get single contact/user
router.get('/contact', async (req, res)=>{
    let id =  req.query.id;
    if(!id) return res.status(400).json(errorResponse('Contact Person id is required'))
   
    try{

        let contact = await User.findById(id);

        return res.json(successResponse('Contact fetched', contact))
    }catch(e){
        return res.status(500).json(errorResponse(e.toString()))
    }
});

// Messages with contacts (id)
router.get('/messages', async (req, res)=>{
    let id =  req.query.id;
    if(!id) return res.status(400).json(errorResponse('Contact Person id is required'))
   
    try{

        let messages = await Message.find({
            $or: [ 
                { $and: [{sender: req.user_id}, {receiver: id}] },
                { $and: [{sender: id}, {receiver: req.user_id}] },
            ]
        })

        return res.json(successResponse('Messages fetched', messages))
    }catch(e){
        return res.status(500).json(errorResponse(e.toString()))
    }
});
// router.post('/message/:id', async (req, res)=>{
//     let id = req.params.id;
//     const {text} = req.body;
    
//     try{
//         let msg = await Message.create({
//             text: text,
//             sender: req.user_id,
//             receiver: id
//         })

//         return res.json(successResponse('Message posted', msg))
//     }catch(e){
//         return res.status(500).json(errorResponse(e.toString()))
//     }
// });

module.exports = router;
const express = require('express');
const {Server} = require('socket.io');
const helmet = require('helmet');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRouter = require('./Routes/AuthRoutes');
const chatRouter = require('./Routes/ChatRoutes');
const authMiddleware = require('./middlewares/auth');
const Message = require('./models/message');

require('dotenv').config();
require('./database/connection')();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(helmet());
app.use(cors({
    origin:'http://localhost:4000',
}));

// Routes
app.use('/auth',authRouter);
app.use('/chat', authMiddleware,chatRouter);


// Socket IO Start
let onlineUsers = {}; 

const io = new Server(server, {
    cors:{
        origin: 'http://localhost:4000',
    }
});

io.use((socket, next)=>{
    let token = socket.handshake.auth?.token;
    try{
        let data = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY);
        let user_id = data.id
        socket.user_id = user_id;
        onlineUsers[user_id] = socket.id;
        next();
        
    }catch(e){
        next(new Error(e.toString()));
    }
    return;
});

io.on('connection',(socket)=>{
    socket.on('send-message', (message)=>{
            try{
                let msgObj = {
                    text: message.text,
                    sender: socket.user_id,
                    receiver: message.receiver
                };
                Message.create(msgObj);
                msgObj.createdAt = new Date();
                if(onlineUsers[message.receiver]){
                    console.log('dispatching msg: ',msgObj)
                    socket.to( onlineUsers[message.receiver] ).emit('receive-message', msgObj);
                }

            }catch(e){
                return res.status(500).json(errorResponse(e.toString()))
            }

    });

    socket.on('disconnect', ()=>{
        delete onlineUsers[socket.user_id];
    })

});


const PORT  = process.env.PORT || 3000;
server.listen(PORT,()=> console.log(`Node App Running at http://localhost:${PORT}`));
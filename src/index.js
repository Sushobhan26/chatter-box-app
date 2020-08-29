const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInGroup } = require('./utils/user')

const app = express()
//create an http server using the express --> this express anyhow does at the backend
const server = http.createServer(app)
//socketio expects it to be called with the raw http server
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDir = path.join(__dirname, '../public')
app.use(express.static(publicDir))


//connection event gets fired whever socketio has a new client/connection
//built in events
io.on('connection',(socket) => {
    console.log('New websocket connection')

    /*socket.emit --> to the user
    io.emit --> to everyone
    socket.broadcast.emit --> to everyone except the user
    io.to.emit --> to everyone IN THE ROOM
    socket.broadcast.to(ROOM).emit --> to everyone except the user IN THE ROOM*/

    //join group event
    socket.on('join', ({ username, group }, callback) => {
        
        //socket.id is a unique identifier for every connection
        const { error, user } = addUser({ id: socket.id, username, group })

        if(error){
            return callback(error)
        }
        
        //socket.join allows to join the particular chatroom provided
        socket.join(user.group)

        socket.emit('message', generateMessage(`Welcome ${user.username}!`))
        socket.broadcast.to(user.group).emit('message', generateMessage(`${user.username} has joined the group!`))

        io.to(user.group).emit('groupData', {
            group: user.group,
            users: getUsersInGroup(user.group)
        })
        callback()
    })

    //callback is to catch the acknowledgement
    socket.on('sendMessage', (message, callback) =>{

        const user = getUser(socket.id)

        const filter = new Filter()
        filter.addWords('bal', 'Bal');
        if(filter.isProfane(message)){
            return callback('I love you !! :)')
        }

            io.to(user.group).emit('message', generateMessage(user.username, message))
            callback()
        })
     
    //catching sendlocation even
    socket.on('sendLocation', (location, callback) =>{

        const user = getUser(socket.id)
        io.to(user.group).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('Location shared!')
    })

  

    //buit in func for disconnection
    socket.on('disconnect', ()=> {

        const user = removeUser(socket.id)
        if(user){
        io.to(user.group).emit('message', generateMessage(`${user.username} has left the group!`))
        io.to(user.group).emit('groupData', {
            group: user.group,
            users: getUsersInGroup(user.group)
        })
        }
    })
})

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
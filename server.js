const { Server } = require('socket.io')
// const port = process.env.PORT || 8000

const io = new Server(8000, { cors: true })

const usernameToSocketMapping = {}
const socketToUsernameMapping = {}

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('join-room-req', ({ roomId, username }) => {
        console.log(roomId, username)
        usernameToSocketMapping[username] = socket.id
        socketToUsernameMapping[socket.id] = username
        io.to(roomId).emit('new-user-joined', { socketId: socket.id, username })
        socket.join(roomId)
        io.to(socket.id).emit('join-room-res', { roomId })
    })

    socket.on('call-user-req', ({ to, offer }) => {
        io.to(to).emit('incoming-call', { from: socket.id, offer })
    })

    socket.on('call-accepted', ({ to, answer }) => {
        io.to(to).emit('call-accepted-res', { from: socket.id, answer })
    })

    socket.on('negotiation', ({ to, offer }) => {
        io.to(to).emit('negotiation-res', { from: socket.id, offer })
    })

    socket.on('negotiation-res-accepted', ({ to, answer }) => {
        io.to(to).emit('negotiation-done', { from: socket.id, answer })
    })

    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${socketToUsernameMapping[socket.id]}`)
    });
})


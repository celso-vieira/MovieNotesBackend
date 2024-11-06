const { Router } = require('express')

const routes = Router()

const usersRoutes = require('./users.routes')
const movieNotesRoutes = require('./movieNotes.routes')

routes.use('/users', usersRoutes)
routes.use('/notes', movieNotesRoutes)

module.exports = routes

const route = require('express').Router()
const jobController = require('../controller/jobController')


route.get(`/`, jobController.getAll)  // read all
route.get(`/:id`, jobController.getSingle) // read single

route.post(`/`, jobController.create) // create

route.patch(`/:id`, jobController.update) // update

route.delete(`/:id`, jobController.delete) // delete

module.exports = route
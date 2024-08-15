import client from './client'

const getAllSidekicks = () => client.get('/sidekicks')
const getSidekickById = (id) => client.get(`/sidekicks/${id}`)
const createSidekick = (data) => client.post('/sidekicks', data)
const updateSidekick = (id, data) => client.put(`/sidekicks/${id}`, data)
const deleteSidekick = (id) => client.delete(`/sidekicks/${id}`)

export default {
    getAllSidekicks,
    getSidekickById,
    createSidekick,
    updateSidekick,
    deleteSidekick
}

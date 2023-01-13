const { StatusCodes } = require('http-status-codes')
const Job = require('../model/Job')

const jobController = {
    getAll: async (req,res) => {
        try {
            const jobs = await Job.find()
                res.status(StatusCodes.OK).json({
                    data: jobs,
                    length: jobs.length
                })
            
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    getSingle: async (req,res) => {
        try {
            const id = req.params.id

            const single = await Job.findById({ _id: id})
                 if(!single)
                    return res.status(StatusCodes.NOT_FOUND).json({ msg: "requested job id not found"})

                 res.status(StatusCodes.OK).json({
                    data: single
                })
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    create: async (req,res) => {
        try {
            const { job_id, title, desc, role, salary, company, tech } = req.body

            const job = await Job.findOne({ job_id })
                if(job)
                    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "job code already exists"})

            await Job.create({
                job_id, title,desc, role,salary, company, tech
            })
            
            return res.status(StatusCodes.OK).json({ msg: "New job created successfully"})

        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    update: async (req,res) => {
        try {
            const id = req.params.id
            const { job_id, title, desc, role,salary, company, tech} = req.body

            const single = await Job.findOne({ job_id })
                if(!single)
                return res.status(StatusCodes.NOT_FOUND).json({ msg: "requested job id not found"})

         await Job.findByIdAndUpdate({ _id: id}, {
                job_id,
                title,
                desc,
                role,
                salary,
                company,
                tech
            });

            res.status(StatusCodes.OK).json({ msg: "Successfully updated" })

        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    },
    delete: async (req,res) => {
        try {
            const id = req.params.id

            const single = await Job.findById({ _id: id})
            if(!single)
               return res.status(StatusCodes.NOT_FOUND).json({ msg: "requested job id not found"})

            await Job.findByIdAndDelete({ _id: id})
                res.status(StatusCodes.OK).json({ msg: "Job deleted successfully"})

        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
        }
    }
}

module.exports = jobController
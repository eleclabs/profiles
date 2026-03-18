const Log = require("../models/Log")

module.exports = async (req, res, next) => {

    await Log.create({

        user: req.user?.id,
        action: req.originalUrl,
        ip: req.ip

    })

    next()

}
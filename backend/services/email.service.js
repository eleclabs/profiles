const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({

    service: "gmail",
    auth: {
        user: "eleclabs@gmail.com",
        pass: "@6Eba0874"
    }

})

async function sendEmail(email, link) {

    await transporter.sendMail({

        from: "noreply@test.com",
        to: email,
        subject: "Verify Email",
        html: `<a href="${link}">Verify Email</a>`

    })

}

module.exports = sendEmail


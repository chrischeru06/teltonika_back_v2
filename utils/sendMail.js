const nodemailer = require("nodemailer")
const fs = require("fs")
const { convert } = require("html-to-text")
const ejs = require("ejs")
const juice = require("juice")

const devTransport = {
   host: "0.0.0.0",
   port: 1025,
   ignoreTLS: true,
}

const prodTransport = {
   host: process.env.MAIL_HOST,
   port: 465,
   secure: true,
   auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
   },
   ignoreTLS: true,
   tls: {
      rejectUnauthorized: false,
   },
}

const sendMail = async (mailOptions, templateName, data) => {
   try {
      const transporter = nodemailer.createTransport(process.env.NODE_ENV === "local" ? devTransport : prodTransport)
      const templatePath = `views/emails/${templateName}.ejs`
      if (templateName && fs.existsSync(templatePath)) {
         const template = fs.readFileSync(templatePath, "utf-8")
         let html = ejs.render(template, data)
         const text = convert(html)
         const withInlineStyle = juice(html)

         return await transporter.sendMail({
            from: {
               name: "Wasili Burundi",
               address: "info@wasiliburundi.bi",
            },
            html: withInlineStyle,
            text,
            ...mailOptions,
         })
      } else {
         return await transporter.sendMail({
            from: {
               name: "Wasili Burundi",
               address: "info@wasiliburundi.bi",
            },
            ...mailOptions,
         })
      }
   } catch (error) {
      console.log(error)
      return error
   }
}
module.exports = sendMail

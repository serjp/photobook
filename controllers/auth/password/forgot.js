const crypto = require('crypto')
const User = require('../../../models/User')
const sendMail = require('../../../modules/nodemailer')

module.exports = async ctx => {
  const {email} = ctx.request.body
  const user = await User.findOne({ email })

  if (!user) ctx.throw(404, 'Can\'t find that email')

  user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 // 1 hour from now

  await user.save()

  const url = `${process.env.APP_URL}:${process.env.PORT}${ctx.router.url('reset-password', user.resetPasswordToken)}`

  await sendMail(user.email, 'Password Reset', 'reset-password', {url})

  ctx.body = 'OK'
}

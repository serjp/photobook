const mongoose = require('mongoose')
const Album = require('../models/Album')
const Photo = require('../models/Photo')

exports.loadAlbumByid = async (id, ctx, next) => {
  ctx.assert(mongoose.Types.ObjectId.isValid(id), 404, 'Invalid link!')

  ctx.album = await Album.findById(id)
  ctx.assert(ctx.album, 404, 'Album not found!')

  await next()
}

exports.put = async (ctx, next) => {
  if (!ctx.request.files.length) ctx.throw(400, 'Album cover is required!')
  const { name, description } = ctx.request.body
  const album = new Album({ name, description, author: ctx.state.user })
  const cover = album.cover = await Photo.createAndSaveToDisk({ album, author: ctx.state.user }, ctx.request.files[0])

  try {
    await album.save()
  } catch (err) {
    cover.removeFromDiskAndDb()
    throw err
  }

  ctx.redirect(`/albums/${album.id}`)
}

exports.get = async (ctx, next) => {
  await ctx.album.populate('photos').populate('cover').execPopulate()
  ctx.render('albums/show', {
    album: ctx.album,
    title: ctx.album.name
  })
}

exports.patch = async (ctx, next) => {
  const { name, description } = ctx.request.body

  Object.assign(ctx.album, { name, description })
  if (ctx.request.files.length) {
    ctx.album.cover = await Photo.createAndSaveToDisk({ album: ctx.album }, ctx.request.files[0])
  }
  await ctx.album.save()

  ctx.flash('success', 'Album successfully updated')
  ctx.redirect('back')
}

exports.delete = async (ctx, next) => {
  await Photo.removeFromDiskAndDb({ album: ctx.album.id })
  await ctx.album.remove()

  ctx.flash('success', 'Album successfully removed')
  ctx.redirect('/')
}

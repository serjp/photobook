const mongoose = require('mongoose');
const Photo = require('../models/Photo');
const fs = require('fs-extra');


exports.checkFiles = async (ctx, next) => {
  const images = ctx.request.files.filter(readable => {
    const isImage = readable.mime.startsWith('image/');
    if (isImage) return readable;

    fs.unlink(readable.path); // probably don't need to use fs.unlink(). The OS will do the clean up.
    ctx.flash('error', `${readable.filename} - is not image!`);
  });

  ctx.request.files = images;
  await next();
};

exports.loadPhotoById = async (id, ctx, next) => {
  ctx.assert(mongoose.Types.ObjectId.isValid(id), 404, 'Invalid link!');
  ctx.photo = await Photo.findById(id).populate('album');
  ctx.assert(ctx.photo, 404, 'File not found!');
  await next();
};

exports.put = async (ctx, next) => {
  const files = ctx.request.files.map(async readable => {
    const photo = new Photo({ album: ctx.album });
    await photo.saveToDisk(readable);
  });

  await Promise.all(files);

  console.log('all saved');

  if (ctx.request.files.length) ctx.flash('success', 'Photos added');
  ctx.redirect('back');
};

exports.patch = async (ctx, next) => {
  const { name, description } = ctx.request.body;

  Object.assign(ctx.photo, { name, description });
  await ctx.photo.save();

  ctx.flash('success', 'Photo successfully updated');
  ctx.redirect('back');
};

exports.delete = async (ctx, next) => {
  if (ctx.photo.id === ctx.photo.album.cover.toString()) {
    ctx.flash('error', 'You can\'t remove album cover!');
  } else {
    await ctx.photo.remove();
    ctx.flash('success', 'Photo successfully removed');
  }
  ctx.redirect('back');
};

const imagemin = require('imagemin');
//Lossy compression
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
// const imageminGiflossy = require('imagemin-giflossy');
// const imageminSvgo = require('imagemin-svgo');
// const imageminWebp = require('imagemin-webp');
//Lossless compression
// const imageminJpegtran = require('imagemin-jpegtran');
// const imageminOptipng = require('imagemin-optipng');
const imageminGifsicle = require('imagemin-gifsicle');

async function compress(input, output, opts) {
    input = input.replace(/\\/g,"/");
    output = output.replace(/\\/g,"/");
    let compressData = await imageminCompress(input, output, opts);
    return compressData;
}

async function imageminCompress(input, output, opts) {
    if(opts.png.quality[0]>1){
        opts.png.quality=[opts.png.quality[0]/10, opts.png.quality[1]/10];
    }
    return await imagemin([input], {
        destination: output,
        plugins: [
            // imageminJpegtran(),
            imageminMozjpeg(opts.jpg),
            imageminPngquant(opts.png),
            // imageminOptipng({
            //     optimizationLevel: 3
            // }),
            imageminGifsicle(opts.gif),
        ],
    })
    .then((file) => {
        return {
            status: true,
            data: file,
        };
    })
    .catch((e) => {
        return {
            status: false,
            error: e.toString(),
        };
    });
}

module.exports = {
    compress: compress,
};

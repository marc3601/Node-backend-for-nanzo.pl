const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose');
const upload = multer({ dest: 'upload/' })
const fs = require("fs")
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const app = express();
const { v4: uuidv4 } = require('uuid');
const port = 8080
const sharp = require('sharp');
const cors = require('cors');
const DIR = '/upload';
app.use(cors());
app.options('*', cors());
process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
})
// Database
mongoose.connect('mongodb://localhost:27017/images', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database connected");
});
const auctionSchema = new mongoose.Schema({
    image: [
        {
            width: Number,
            height: Number,
            url: String
        }
    ],
    description: String,
    title: String,
    price: Number,
    id: String
});
const Auction = mongoose.model('Auction', auctionSchema);
//Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = req.body.title;
        cb(null, fileName)
    }
});
// Auction.deleteMany((err, auctions) => {
//     if (err) return console.error(err);
//     console.log(auctions)
// })
const { uploadFile, getFileStream, deleteFiles } = require("./s3")
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})
app.get("/api/auctions", (req, res) => {
    Auction.find((err, auctions) => {
        if (err) return console.error(err);
        res.send(auctions)
    })
})
app.get("/images/:key", (req, res) => {
    const key = req.params.key
    try {
        const readStream = getFileStream(key);
        readStream.pipe(res)
    } catch (err) {
        res.sendStatus(404)
    }
})
app.post('/upload', upload.array("image", 6), async (req, res, next) => {
    if (req.files.length !== 0) {
        const title = req.body.title
        const description = req.body.description
        const price = req.body.price
        let image = [];
        const handleImageResizing = async (req) => {
            if (!req.files) return next();
            await Promise.all(
                req.files.map(async (item, id) => {
                    await sharp(item.path)
                        .rotate()
                        .resize(550)
                        .jpeg({ mozjpeg: true })
                        .toFile(`upload/result${id}.jpeg`)
                        .then(async (data) => {
                            const result = await uploadFile(`upload/result${id}.jpeg`, item).catch((err) => console.log(err))
                            const url = `https://doge-memes.com/images/${item.filename}`;
                            image.push({
                                width: data.width,
                                height: data.height,
                                url: url
                            })
                            await unlinkFile(item.path);
                            await unlinkFile(`upload/result${id}.jpeg`);
                        })
                })
            ).then(() => {
                const auction = new Auction({ image: image, description: description, title: title, price: price, id: uuidv4() });
                auction.save((err, auction) => {
                    if (err) return console.error(err);
                    console.log("Saved: " + auction)
                });
                image = [];
            }).catch((err) => {
                res.send("Wystapil blad serwera")
            })
        }
        handleImageResizing(req)
        res.redirect("/")
    } else {
        res.send("Wybierz pliki do wgrania")
    }
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
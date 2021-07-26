const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose');
const upload = multer({ dest: 'upload/' })
const fs = require("fs")
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const app = express()
const port = 8080
const sharp = require('sharp');
const cors = require('cors');

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
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database connected");
});
const imageSchema = new mongoose.Schema({
    url: String,
    width: Number,
    height: Number,
    description: String,
    title: String,
    urlParam: String
});
const Image = mongoose.model('Image', imageSchema);



// Image.deleteMany((err, pictures) => {
//     if (err) return console.error(err);
//     console.log(pictures)
// })
const { uploadFile, getFileStream, deleteFiles } = require("./s3")


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get("/api/images", (req, res) => {
    Image.find((err, pictures) => {
        if (err) return console.error(err);
        res.send(pictures)
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

app.post('/upload', upload.single('image'), async (req, res, next) => {
    const file = req.file
    const title = req.body.title
    const description = req.body.description
    sharp(file.path)
        .rotate()
        .resize(550)
        .jpeg({ mozjpeg: true })
        .toFile(`upload/resize.jpeg`)
        .then(async (data) => {
            console.log(data);
            const result = await uploadFile(file).catch((err) => console.log(err))
            const url = `http://localhost:8080/images/${file.filename}`;
            const picture = new Image({ url: url, width: data.width, height: data.height, description: description, title: title, urlParam: file.filename });
            picture.save((err, picture) => {
                if (err) return console.error(err);
                console.log("Saved: " + picture)
            });
            await unlinkFile(file.path);
            await unlinkFile('upload/resize.jpeg');
            console.log(result);
            res.redirect("/")
        })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
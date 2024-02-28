require('dotenv').config()
const fs = require("fs")
const S3 = require("aws-sdk/clients/s3")
const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

function uploadFile(path, file) {
    const fileStream = fs.createReadStream(path)
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    }

    return s3.upload(uploadParams).promise()
}


exports.uploadFile = uploadFile

function uploadGif(path, fileName) {
    const fileStream = fs.createReadStream(path)
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: fileName
    }

    return s3.upload(uploadParams).promise()
}

exports.uploadGif = uploadGif


function getFileStream(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }

    return s3.getObject(downloadParams).createReadStream()

}


exports.getFileStream = getFileStream


function deleteFiles(id) {
    const deleteParams = {
        Bucket: bucketName,
        Delete: {
            Objects: [{ Key: id }]
        }
    }
    return s3.deleteObjects(deleteParams).promise();

}

exports.deleteFiles = deleteFiles;



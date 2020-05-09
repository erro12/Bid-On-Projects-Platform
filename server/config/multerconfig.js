import multer from 'multer';
import pathDirectory from 'path';
import { checkFileType, checkFileTypeV, checkFileTypePDF } from '../functions/functions';

export const profileImgStorage = multer.diskStorage({
    destination: './public/uploads/profileimages',
    filename: async (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + pathDirectory.extname(file.originalname));
    }
});
// export const profileImgStorage = multer.diskStorage({
//     destination: './public/uploads/profileimages',
//     filename: async (req, file, cb) => {
//         cb(null, "default" + pathDirectory.extname(file.originalname));
//     }
// });

export const projectPdfStorage = multer.diskStorage({
    destination: './public/uploads/projectfiles',
    filename: async (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + pathDirectory.extname(file.originalname));
    }
});

export const profileVideoStorage = multer.diskStorage({
    destination: './public/uploads/profilevideos',
    filename: async (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + pathDirectory.extname(file.originalname));
    }
});


export const uploadProfileImage = multer({
    storage: profileImgStorage,
    limits: {
        fileSize: 4000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file');

export const uploadProjectPDF = multer({
    storage: projectPdfStorage,
    limits: {
        fileSize: 4000000
    },
    fileFilter: function (req, file, cb) {
        checkFileTypePDF(file, cb);
    }
}).single('file');

export const uploadProfileVideo = multer({
    storage: profileVideoStorage,
    limits: {
        fileSize: 400000000
    },
    fileFilter: function (req, file, cb) {
        checkFileTypeV(file, cb);
    }
}).single('file');

const { Router } = require("express");
const { check } = require("express-validator");
const path = require("path");
const { v4 } = require("uuid");
//Default Data
const { roles } = require("config").get("routes");
const { createPermissions, updatePermissions, deletePermissions, readPermissions } = require("config").get("permissionType");
//Controlllers
const { newAttachmentUser, getAttachment, deleteUserAttachment, getAttachmentInfo } = require("../controllers/utilsController");
//Validator

//middlewares
const { permission } = require("../middlewares/RoleValidation");
const { validationFields } = require("../middlewares/validation-fields");
const { jwtValidation } = require("../middlewares/webtokenValidation");

const maxSize = 20 * 1024 * 1024;
//files
const multer = require("multer");
const storage = multer.diskStorage({
    destination: "./assets",
    limits: { fileSize: maxSize },
    filename: (req, file, cb) => {
        cb(null, v4() + path.extname(file.originalname).toLocaleLowerCase());
    },
});
const uploadFile = multer({
    storage,
    dest: "./assets",
    limits: { fileSize: maxSize },
});

const router = Router();

////////////////////////////////////Get////////////////////////////////////
router.get("/attachment/:fileId", [
    check("fileId", "The User Id is required").isMongoId().notEmpty(),
    uploadFile.single("file"),
    validationFields,
], getAttachment);

router.get("/attachment/info/:fileId", [
    jwtValidation,
    check("fileId", "The file Id is required").isMongoId().notEmpty(),
    validationFields,
], getAttachmentInfo);

////////////////////////////////////POST///////////////////////////////////
router.post("/attachment/:userId", [
    jwtValidation,
    check("userId", "The User Id is required").isMongoId().notEmpty(),
    uploadFile.single("file"),
    validationFields,
], newAttachmentUser);

////////////////////////////////////Delete////////////////////////////////////
router.delete("/attachment/:userId/:attachmentId", [
    jwtValidation,
    check("userId", "The User Id is required").isMongoId().notEmpty(),
    check("attachmentId", "The User Id is required").isMongoId().notEmpty(),
    validationFields,
], deleteUserAttachment);

module.exports = router;
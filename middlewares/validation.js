const { check } = require("express-validator");

const isReqMsg = "is required";
const lengthMsg = "should be between 5 and 35 characters";

module.exports.registerValidation = [
  check("username")
    .exists()
    .withMessage(`Username ${isReqMsg}`)
    .isLength({ min: 5, max: 35 })
    .withMessage(`Username ${lengthMsg}`),
  check("password")
    .exists()
    .withMessage(`Password ${isReqMsg}`)
    .isLength({ min: 5, max: 35 })
    .withMessage(`Password ${lengthMsg}`),
  check("confirm_password")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Password did not match");
      return true;
    })
    .withMessage("Passwords did not match."),
];

module.exports.postValidation = [
  check("title")
    .exists()
    .withMessage(`Title ${isReqMsg}`)
    .isLength({ min: 5, max: 45 })
    .withMessage(`Title ${lengthMsg}`),
  check("content")
    .exists()
    .withMessage(`Content ${isReqMsg}`)
    .isLength({ min: 8, max: 60 })
    .withMessage(`Content should be between 8 and 60 characters`),
];

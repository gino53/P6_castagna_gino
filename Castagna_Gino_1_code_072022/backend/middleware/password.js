const passwordValidator = require("password-validator");

const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(1)
    .has().not().spaces()

module.exports = (req, res, next) => {
    if (passwordSchema.validate(req.body.password)) {
        next();
    } else {
        return res.status(400).json({ error: "Le mot de passe n'est pas assez fort !" + passwordSchema.validate("req.body.password", { list: true }) })
    }
}
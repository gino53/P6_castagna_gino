const Sauce = require("../models/sauce");

const fs = require("fs");

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        userId: sauceObject.userId,
        name: sauceObject.name,
        manufacturer: sauceObject.manufacturer,
        description: sauceObject.description,
        mainPepper: sauceObject.mainPepper,
        heat: sauceObject.heat,
        likes: "0",
        dislikes: "0",
        usersLiked: [],
        usersDislikes: [],
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    });
    sauce.save()
        .then(res.status(201).json({ message: "Sauce créée avec succès !" }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : { ...req.body };
    if (sauceObject.imageUrl == null) {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
            .catch(error => res.status(400).json({ error }));
    } else {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                const filename = sauce.imageUrl.split("/images/")[1];

                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Image supprimé" }))
                        .catch(error => res.status(400).json({ error }));
                });
            });
    }
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({ message: "Sauce supprimée !" }) })
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    switch (req.body.like) {
        case 1:
            Sauce.updateOne({ _id: req.params.id }, {
                $inc: { likes: +1 },
                $push: { usersLiked: req.body.userId }
            })
                .then(() => res.status(201).json({ message: "Like ajouté !" }))
                .catch(error => res.status(500).json({ error }));
            break;

        case -1:
            Sauce.updateOne({ _id: req.params.id }, {
                $inc: { dislikes: +1 },
                $push: { usersDisliked: req.body.userId }
            })
                .then(() => res.status(201).json({ message: "Dislike ajouté !" }))
                .catch(error => res.status(500).json({ error }));
            break;

        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            $inc: { likes: -1 },
                            $pull: { usersLiked: req.body.userId }
                        })
                            .then(() => res.status(201).json({ message: "Like été retiré !" }))
                            .catch(error => res.status(500).json({ error }));
                    }

                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            $inc: { dislikes: -1 },
                            $pull: { usersDisliked: req.body.userId }
                        })
                            .then(() => res.status(201).json({ message: "Dislike été retiré !" }))
                            .catch(error => res.status(500).json({ error }));
                    }
                })
                .catch(error => res.status(500).json({ error }));
            break;
    }
};
import { db } from "../config/db.config.js";
import Category from '../models/category.model.js';
import User from '../models/user.model.js';
import { Sequelize } from "sequelize";
import cloudinary from "../config/cloudinary.config.js";
import * as fs from 'fs';
import path from "path";

export async function getAll(req, res) {
    const userId = req.userId;
    let category = await Category.findAll({
        where: {
            userId: userId
        },
        attributes: ["id", "name", "description", "image"],
        order: [
            ["id", "DESC"]
        ],
        include: {
            model: User,
            attributes: ["name", "lastname", "email", "username"]
        }
    });
    res.status(200).send({ data: category });
}

export async function getById(req, res) {
    try {
        const { id } = req.params
        const userId = req.userId;
        if (id === undefined) return res.status(404).send({ message: 'No id provided' });
        // let category = await Category.findByPk(id);
        let category = await Category.findOne({
            where: {
                id: id,
                userId: userId
            },
            attributes: ["id", "name", "description", "image"],
            order: [
                ["id", "DESC"]
            ],
            include: {
                model: User,
                attributes: ["name", "lastname", "email", "username"]
            }
        });
        if (!category) return res.status(404).send({ message: 'A category with the id you entered has not been found, or it does not belong to your user, try putting another id.' });
        res.status(200).send({ data: category });
    } catch (error) {

    }
}

export async function create(req, res) {
    try {
        const userId = req.userId;
        const { name, description } = req.body;
        const img_path = req.files.image.path;

        let name_img = img_path.split("\\");
        let portada_name = name_img[2];
        let fileName = userId + '-' + ~~(Math.random() * 9999) + '-' + name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        const uploadImg = await cloudinary.uploader.upload(img_path, {
            upload_preset: 'trycatch',
            resource_type: "auto",
            folder: 'trycatch/category',
            public_id: `${fileName}`,
        });

        fs.stat("./uploads/category/" + portada_name, (err) => {
            if (!err) {
                fs.unlink("./uploads/category/" + portada_name, (err) => {
                    if (err) console.log("There is no image to delete");
                });
            }
        });

        let category = await Category.create({
            name: name,
            description: description,
            image: uploadImg.secure_url,
            public_id: uploadImg.public_id,
            userId: userId
        });

        if (category) {
            res.status(201).send({ message: `Category created successfully`, data: category });
        } else {
            res.status(400).send({ message: `Failed to create category` });
        }
    } catch (error) {
        res.status(500).send({ message: `Failed to create category` });
        console.log(error);
    }
}
import { DataTypes } from "sequelize";
import { db } from "../config/db.config.js";

const Category = db.define("category", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        // validate: {
        //     async isUnique(value) {
        //         const category = await Category.findOne({ where: { name: value } });
        //         if (category) {
        //             throw new Error('El nombre de categoría ya está en uso');
        //         }
        //     },
        // },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    public_id: {
        type: DataTypes.STRING(150),
        allowNull: true
    }
}, {
    timestamps: true
});


// Create the database constraint if it does not exist
const createConstraint = async() => {
    await db.query(`
      ALTER TABLE "categories"
      ADD CONSTRAINT unique_category_per_user
      UNIQUE ("name", "userId");
    `);
};

// Check if "unique_category_per_user" constraint already exists
const constraintExists = async() => {
    const [result] = await db.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE constraint_name = 'unique_category_per_user'
    `);
    if (result.length < 1) {
        await createConstraint();
        console.log(`Successful creation of unique keys`.bgGreen.white);
    }
};


constraintExists();



export default Category;
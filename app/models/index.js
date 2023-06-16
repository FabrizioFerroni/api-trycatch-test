import User from './user.model.js';
import Role from './role.model.js';
import UserRole from './userrole.model.js';
import Log from './log.model.js';
import Category from './category.model.js';
import Product from './product.model.js';
import Provider from './provider.model.js';

// Relation N:N Users-Role
User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId'
});

Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId'
});

// Relation 1:N user - log
User.hasMany(Log, {
    foreinkey: "user_id",
    sourceKey: "id",
});
Log.belongsTo(User, { foreinkey: "user_id", targetId: "id" });

// Relation 1:N user - category
User.hasMany(Category, {
    foreinkey: "user_id",
    sourceKey: "id",
});
Category.belongsTo(User, { foreinkey: "user_id", targetId: "id" });

// Relation 1:N user - product
User.hasMany(Product, {
    foreinkey: "user_id",
    sourceKey: "id",
});
Product.belongsTo(User, { foreinkey: "user_id", targetId: "id" });

// Relation 1:N category - product
Category.hasMany(Product, {
    foreinkey: "category_id",
    sourceKey: "id",
});
Product.belongsTo(Category, { foreinkey: "category_id", targetId: "id" });

// Relation 1:N user - product
Provider.hasMany(Product, {
    foreinkey: "provider_id",
    sourceKey: "id",
});
Product.belongsTo(Provider, { foreinkey: "provider_id", targetId: "id" });
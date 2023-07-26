const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// [VALIDATION]
function hasName(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name) {
        res.locals.name = name;
        return next();
    }
    next({
        status: 400,
        message: `Missing name`
    })
}

function hasDescription(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description) {
        res.locals.description = description;
        return next();
    }
    next({
        status: 400,
        message: `Missing description`
    })
}

function hasPrice(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (price) {
        return next();
    }
    next({
        status: 400,
        message: `Dish must include a price`
    })
}

function hasValidPrice(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (Number(price) > 0 && Number.isInteger(Number(price))) {
        res.locals.price = price;
        return next();
    }
    next({
        status: 400,
        message: `Dish must have a price that is an integer greater than 0`
    })
}

function priceIsNumber(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (typeof(price) == "number") {
        return next();
    }
    next({
        status: 400,
        message: `Dish must have a price that is a number`
    })
}

function hasImage(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if (image_url) {
        res.locals.image_url = image_url;
        return next();
    }
    next({
        status: 400,
        message: `Dish must include a image_url`
    })
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    })
}

function matchId(req, res, next) {
    const { data: { id } = {} } = req.body;
    const { dishId } = req.params;
    if (!id || dishId === id) {
        res.locals.id = id;
        return next();
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
}

// [CREATE]
function create(req, res) {
    const newDish = {
        id: nextId(),
        name: res.locals.name,
        description: res.locals.description,
        price: res.locals.price,
        image_url: res.locals.image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish })
}

// [READ]
function read(req, res) {
    res.status(200).json({ data: res.locals.dish })
}

// [UPDATE]
function update(req, res) {
    const dish = res.locals.dish;
    const newId = res.locals.id ? res.locals.id : nextId();

    dish.id = newId;
    dish.name = res.locals.name;
    dish.description = res.locals.description;
    dish.image_url = res.locals.image_url;
    dish.price = res.locals.price;
    
    res.json({ data: dish })
}

// [LIST]
function list(req, res) {
    res.json({ data: dishes })
}

module.exports = {
    create: [
        hasName,
        hasDescription,
        hasPrice,
        hasValidPrice,
        hasImage,
        create
    ],
    read: [
        dishExists,
        read
    ],
    update: [
        dishExists,
        hasName,
        hasDescription,
        hasPrice,
        hasValidPrice,
        priceIsNumber,
        hasImage,
        matchId,
        update
    ],
    list
}
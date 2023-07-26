const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// [VALIDATION]
function hasDeliverTo(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo) {
        res.locals.deliverTo = deliverTo;
        return next();
    }
    next({
        status: 400,
        message: `Order must include a deliverTo`
    })
}

function hasMobileNumber(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber) {
        res.locals.mobileNumber = mobileNumber;
        return next();
    }
    next({
        status: 400,
        message: `Order must include a mobileNumber`
    })
}

function includesDish(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (dishes) {
        return next();
    }
    next({
        status: 400,
        message: `Order must include a dish`
    })
}

function hasDishes(req, res, next) {
    const { data: { dishes } = {} }= req.body;
    if (Array.isArray(dishes) && dishes.length) {
        return next();
    }
    next({
        status: 400,
        message: `Order must include at least one dish`
    })
}

function hasQuantity(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    const index = dishes.findIndex((dish) => !dish.quantity || !Number.isInteger(dish.quantity));
    if (index == -1) {
        res.locals.dishes = dishes;
        return next();
    }
    next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`
    })
}

function status(req, res, next) {
    const { data: { status } = {} } = req.body;
    res.locals.status = status;
    next();
}

function hasStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
    if (["pending", "preparing", "out-for-delivery", "delivered"].includes(status)) {
        return next();
    }
    next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
    })
}

function isDelivered(req, res, next) {
    const { data : { status } = {} } = req.body;
    if (status !== "delivered") {
        res.locals.status = status;
        return next();
    }
    next({
        status: 400,
        message: `A delivered order cannot be changed`
    })
}

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order ${orderId} not found`
    })
}

function matchId(req, res, next) {
    const { data: { id } = {} } = req.body;
    const { orderId } = req.params;
    if (!id || id === orderId ) {
        next();
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    })
}

function isPending(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder && foundOrder.status == "pending") {
        return next();
    }
    next({
        status: 400,
        message: `An order cannot be deleted unless it is pending.`
    })
}

// [CREATE]
function create(req, res) {
    const newOrder = {
        id: nextId(),
        deliverTo: res.locals.deliverTo,
        mobileNumber: res.locals.mobileNumber,
        status: res.locals.status,
        dishes: res.locals.dishes
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder })
}

// [READ]
function read(req, res) {
    res.json({ data: res.locals.order })
}

// [UPDATE]
function update(req, res) {
    const order = res.locals.order;
    order.deliverTo = res.locals.deliverTo;
    order.mobileNumber = res.locals.mobileNumber;
    order.status = res.locals.status;
    order.dishes = res.locals.dishes;

    res.json({ data: order })
}

// [DELETE]
function destroy(req, res) {
    const index = orders.findIndex(order => order == res.locals.order)
    orders.splice(index, 1);
    res.sendStatus(204);
}

// [LIST]
function list(req, res) {
    res.json({ data: orders })
}

module.exports = {
    create: [
        hasDeliverTo,
        hasMobileNumber,
        includesDish,
        hasDishes,
        hasQuantity,
        status,
        create
    ],
    read: [
        orderExists,
        read
    ],
    update: [
        orderExists,
        matchId,
        hasDeliverTo,
        hasMobileNumber,
        includesDish,
        hasDishes,
        hasQuantity,
        hasStatus,
        isDelivered,
        update
    ],
    delete: [
        orderExists,
        matchId,
        isPending,
        destroy
    ],
    list
}

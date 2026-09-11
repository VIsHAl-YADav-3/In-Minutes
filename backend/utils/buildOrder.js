import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";

const DELIVERY_FEE = 30;
const TAX_RATE = 0.05;

/**
 * Validates the cart against live DB data (never trust client-sent prices)
 * and returns the pieces needed to create an Order document.
 */
export const buildValidatedOrder = async ({ items, restaurantId }) => {
  if (!items?.length) {
    throw Object.assign(new Error("Cart is empty"), { status: 400 });
  }

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isDeleted: false,
    approvalStatus: "approved",
  });
  if (!restaurant) {
    throw Object.assign(new Error("Restaurant not found"), { status: 404 });
  }
  if (!restaurant.isOpen) {
    throw Object.assign(new Error("This restaurant is currently closed and not accepting orders"), {
      status: 400,
    });
  }

  const foodIds = items.map((i) => i.foodId);
  const foods = await Food.find({ _id: { $in: foodIds }, isDeleted: false, restaurant: restaurant._id });

  const orderItems = items.map((cartItem) => {
    const food = foods.find((f) => String(f._id) === String(cartItem.foodId));
    if (!food) {
      throw Object.assign(new Error("One or more items are no longer available"), { status: 400 });
    }
    if (!food.isAvailable) {
      throw Object.assign(new Error(`${food.name} is currently out of stock`), { status: 400 });
    }
    const quantity = Math.max(1, Number(cartItem.quantity) || 1);
    return {
      food: food._id,
      name: food.name,
      price: food.price,
      image: food.image,
      quantity,
    };
  });

  const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxes = Math.round(itemsTotal * TAX_RATE);
  const totalAmount = itemsTotal + DELIVERY_FEE + taxes;

  return { restaurant, orderItems, itemsTotal, deliveryFee: DELIVERY_FEE, taxes, totalAmount };
};

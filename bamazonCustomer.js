const inquirer = require("inquirer");
const mysql = require("mysql2");

// Empty shopping cart.
let itemInCart = {};
let quantityOrdered = 0;

// Create the connection to database.
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  database: "bamazon"
});

// Customer creates an order.
const createOrder = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "productOrdered",
        message: "What is the ID number of the item you want to buy?"
      },
      {
        type: "input",
        name: "quantityOrdered",
        message: "How many units do you want to buy?"
      }
    ])
    .then(answers => {
      connection.query(
        "SELECT * FROM `products` WHERE `item_id` = ?",
        [answers.productOrdered],
        function(err, results) {
          itemInCart = results[0];
          quantityOrdered = answers.quantityOrdered;
          itemInCart.stock_quantity >= quantityOrdered
            ? fulfillOrder(itemInCart, quantityOrdered)
            : (console.log("Insufficient quantity!"), connection.close());
        }
      );
    })
    .catch(err => {
      console.log(err);
    });
};

// Bamazon fulfills order if sufficient quantity.
const fulfillOrder = (itemInCart, quantityOrdered) => {
  connection.query(
    "UPDATE `products` SET product_sales = product_sales + ?, ? WHERE ?",
    [
      quantityOrdered * itemInCart.price,
      { stock_quantity: itemInCart.stock_quantity - quantityOrdered },
      { item_id: itemInCart.item_id }
    ],
    function(err, results) {
      console.log(results);
      console.log(
        `You just bought ${quantityOrdered} unit(s) of ${
          itemInCart.product_name
        }. Your total is $${itemInCart.price * quantityOrdered}. 
          Thank you for shopping with Bamazon!`
      );
    }
  );
  connection.close();
};

// Start app
connection.query("SELECT * FROM `products` WHERE deleted is null", function(
  err,
  results
) {
  console.log("Items for sale today at Bamazon:\n");
  results.forEach(result => {
    console.log(
      `Item ${result.item_id} - ${result.product_name} - $${result.price}`
    );
  });
  createOrder();
});

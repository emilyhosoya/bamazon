const inquirer = require("inquirer");
const mysql = require("mysql2/promise");

// Empty shopping cart.
let itemInCart = {};
let quantityOrdered = 0;

async function main() {
  // Create the connection to database.
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    database: "bamazon"
  });

  // Manager sees admin options.
  const showMenu = () => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "menuChoice",
          message: "What do you want to do?",
          choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product",
            "Exit"
          ]
        }
      ])
      .then(answers => {
        switch (answers.menuChoice) {
          case "View Products for Sale":
            viewProducts();
            break;
          case "View Low Inventory":
            viewLowInventory();
            break;
          case "Add to Inventory":
            addToInventory();
            break;
          case "Add New Product":
            addNewProduct();
            break;
          case "Exit":
            connection.close();
            process.exit();
            break;
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  // If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
  const viewProducts = () => {
    connection.query("SELECT * FROM `products` WHERE deleted is null", function(
      err,
      results
    ) {
      console.log("\nProducts for sale today:");
      results.forEach(result => {
        console.log(
          `Item ${result.item_id} - ${result.product_name} - $${
            result.price
          } - ${result.stock_quantity} left`
        );
      });
    });
    main();
  };

  // If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
  const viewLowInventory = () => {
    connection.query(
      `SELECT * FROM products WHERE deleted is null AND stock_quantity <= 5`,
      function(err, results) {
        console.log("Running low on:\n");
        results.length > 0
          ? results.forEach(result => {
              console.log(
                `Item ${result.item_id} - ${result.product_name} - ${
                  result.stock_quantity
                } left`
              );
            })
          : console.log("Nothing! We are well-stocked on everything.");
      }
    );
    main();
  };

  // If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
  const addToInventory = () => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "id",
          message: "ID of item to stock:"
        },
        {
          type: "input",
          name: "quantity",
          message: "Quantity to stock:"
        }
      ])
      .then(answers => {
        productToStock = {};
        connection.query(
          "UPDATE `products` SET stock_quantity = stock_quantity + ? WHERE ?",
          [answers.quantity, { item_id: answers.id }]
        );
        console.log(`Stocked up ${answers.quantity} units!`);
        main();
      })
      .catch(err => {
        console.log(err);
      });
  };

  // If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
  const addNewProduct = () => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "Item name:"
        },
        {
          type: "input",
          name: "department",
          message: "Department:"
        },
        {
          type: "input",
          name: "price",
          message: "Price:"
        },
        {
          type: "input",
          name: "quantity",
          message: "Units to stock:"
        }
      ])
      .then(answers => {
        connection.query(
          "INSERT INTO `products` (product_name, department_name, price, stock_quantity, product_sales) VALUES (?, ?, ?, ?, ?)",
          [
            answers.name,
            answers.department,
            +answers.price,
            +answers.quantity,
            0
          ]
        );
        console.log(
          `${answers.quantity} units of '${
            answers.name
          }' have been added to the ${answers.department} department at $${
            answers.price
          } per unit.`
        );
        main();
      })
      .catch(err => {
        console.log(err);
      });
  };

  showMenu();
}

main();

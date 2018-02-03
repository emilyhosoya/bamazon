const inquirer = require("inquirer");
const mysql = require("mysql2");
const Table = require("cli-table");

const table = new Table({
  head: [
    "Dept. ID",
    "Dept. Name",
    "Overhead Costs",
    "Product Sales",
    "Total Profit"
  ],
  colWidths: [15, 15, 15, 15, 15]
});

// Create the connection to database.
const connection = mysql.createConnection({
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
          "View Product Sales by Department",
          "Create New Department",
          "Exit"
        ]
      }
    ])
    .then(answers => {
      switch (answers.menuChoice) {
        case "View Product Sales by Department":
          viewSales();
          break;
        case "Create New Department":
          createDepartment();
          break;
        case "Exit":
          connection.close();
          break;
      }
    })
    .catch(err => {
      console.log(err);
    });
};

// When a supervisor selects View Product Sales by Department, the app should display a summarized table in their terminal/bash window.
// The total_profit column should be calculated on the fly using the difference between over_head_costs and product_sales. total_profit should not be stored in any database. You should use a custom alias.
const viewSales = () => {
  connection.query(
    `SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.product_sales
  FROM departments INNER JOIN products ON departments.department_name = products.department_name GROUP BY department_name ORDER BY department_id`,
    function(err, results) {
      results.forEach(result => {
        table.push([
          result.department_id,
          result.department_name,
          result.over_head_costs,
          result.product_sales,
          result.product_sales - result.over_head_costs
        ]);
      });
      console.log(table.toString());
    }
  );
  connection.close();
};

const createDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Department name:"
      },
      {
        type: "input",
        name: "overhead",
        message: "Overhead Costs:"
      }
    ])
    .then(answers => {
      connection.query(
        "INSERT INTO `departments` (department_name, over_head_costs) VALUES (?, ?)",
        [answers.name, +answers.overhead],
        function(err, results) {
          console.log(
            `New department created: ${answers.name}
            Overhead costs: ${answers.overhead}`
          );
        }
      );
      connection.close();
    })
    .catch(err => {
      console.log(err);
    });
};

showMenu();

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

const customers = require("./customers.json");

// 2. Create a list API with search, pagination
app.get("/customers", (req, res) => {
  const { first_name, last_name, city, page, limit } = req.query;
  let results = [...customers];

  if (first_name) {
    results = results.filter((customer) =>
      customer.first_name.includes(first_name)
    );
  }
  if (last_name) {
    results = results.filter((customer) =>
      customer.last_name.includes(last_name)
    );
  }
  if (city) {
    results = results.filter((customer) => customer.city.includes(city));
  }

  if (page && limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    results = results.slice(startIndex, endIndex);
  }

  res.json(results);
});

// 3. Create an API to get single customer data by its id
app.get("/customers/:id", (req, res) => {
  const customerId = parseInt(req.params.id);
  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  res.json(customer);
});

// 4. Create an API to list all unique cities with the number of customers
app.get("/cities", (req, res) => {
  const cityCounts = {};

  customers.forEach((customer) => {
    if (!cityCounts[customer.city]) {
      cityCounts[customer.city] = 1;
    } else {
      cityCounts[customer.city]++;
    }
  });

  res.json(cityCounts);
});

// 5. Create an API to add a customer with validations
app.post("/customers", (req, res) => {
  const newCustomer = req.body;

  // Validate required fields
  if (
    !newCustomer.id ||
    !newCustomer.first_name ||
    !newCustomer.last_name ||
    !newCustomer.city ||
    !newCustomer.company
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate if city and company already exist
  const existingCustomer = customers.find(
    (customer) =>
      customer.city === newCustomer.city &&
      customer.company === newCustomer.company
  );

  if (!existingCustomer) {
    return res
      .status(400)
      .json({
        error: "City and company do not exist for any existing customer",
      });
  }

  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

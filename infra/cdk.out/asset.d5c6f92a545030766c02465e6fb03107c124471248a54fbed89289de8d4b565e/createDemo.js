const { createDemo } = require("../../models/Demo.js");

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body || "{}");
    const demo = await createDemo(data);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Demo booked successfully.", demo }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

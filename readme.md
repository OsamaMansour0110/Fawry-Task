_Fawry E-Commerce Task_

An e-commerce backend system built with JavaScript, Node.js, Express, MongoDB, and Mongoose.

GO TO RUN-APP in the repo, i uploaded images for the run

✅ Features

1. Users cannot add to cart without logging in.
2. Allows adding the same product multiple times with different quantities.
3. Product quantity updates automatically when added to the cart — prevents two users from adding the last item at the same time.

✅ Checkout:

Deletes the cart from the database.
Sends a receipt email to the user’s Gmail.
-> .env file is secured and not committed to GitHub.

✅ Test Cases:

Cannot add to cart without logging in.
Adding the same product with different quantities is handled correctly.
Product quantity is updated immediately upon adding to cart.
Checkout deletes the cart and sends a receipt to Gmail.

.env file is excluded from version control.

✅ Postman Collection:

You can test all features using the Postman collection below:
https://documenter.getpostman.com/view/27516257/2sB34co2i9

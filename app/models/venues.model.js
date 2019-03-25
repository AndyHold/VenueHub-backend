const db = require('../../config/db');

// Function to calculate the distance between two points in latitude and longitude
const haversine = function (longitude1, latitude1, longitude2, latitude2) {
    // Taken from haversine formula
    // Convert each to radians
    longitude1 *= Math.PI / 180;
    latitude1 *= Math.PI / 180;
    longitude2 *= Math.PI / 180;
    latitude2 *= Math.PI / 180;
    // Get the differences
    let longitudeDifference = longitude1 - longitude2;
    let latitudeDifference = latitude1 - latitude2;
    // Use the formula
    let a = Math.sin(latitudeDifference / 2) ** 2 + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDifference / 2) ** 2;
    let c = 2 * Math.asin(Math.sqrt(a));
    // Return the result in km's
    return 6367 * c;
};

exports.getVenues = async function (queries, done) {
    // TODO refactor this code so it is more readable with smaller functions
    // Set the booleans sortByDistance and reverseOrder to false and queryBody to an empty string
    let sortByDistance = false;
    let reverseOrder = false;
    let queryBody = "";
    // If city is a query option
    if (queries.hasOwnProperty("city")) {
        // Start the queryBody with a WHERE keyword and the city requested
        queryBody += "WHERE city='" + queries["city"] + "'";
    }
    // If q is a query option
    if (queries.hasOwnProperty("q")) {
        // If the queryBody has been started already
        if (queryBody.length > 0) {
            // add an AND keyword for the next statement
            queryBody += " AND";
            // Otherwise
        } else {
            // Start the queryBody with a WHERE keyword
            queryBody += "WHERE";
        }
        // Add the query to the queryBody
        queryBody += " venueName LIKE '%" + queries["q"] + "%'";
    }
    // If categoryId is a query option
    if (queries.hasOwnProperty("categoryId")) {
        // If the queryBody has been started already
        if (queryBody.length > 0) {
            // add an AND keyword for the next statement
            queryBody += " AND";
            // Otherwise
        } else {
            // Start the queryBody with a WHERE keyword
            queryBody += "WHERE";
        }
        // Add the query to the queryBody
        queryBody += " categoryId=" + queries["categoryId"];
    }
    // If minStarRating is a query option
    if (queries.hasOwnProperty("minStarRating")) {
        // If the min star rating is not in an appropriate range
        if (queries["minStarRating"] > 5 || queries["minStarRating"] < 1) {
            // Return the done function with a 400 - Bad Request code
            return done(400);
        }
        // If the queryBody has been started already
        if (queryBody.length > 0) {
            // add an AND keyword for the next statement
            queryBody += " AND";
            // Otherwise
        } else {
            // Start the queryBody with a WHERE keyword
            queryBody += "WHERE";
        }
        // Add the query to the queryBody
        queryBody += "  meanStarRating>=" + queries["minStarRating"];
    }
    // If maxCostRating is a query option
    if (queries.hasOwnProperty("maxCostRating")) {
        // If the max cost rating is not in an appropriate range
        if (queries["maxCostRating"] > 4 || queries["maxCostRating"] < 0) {
            // Return the done function with a 400 - Bad Request code
            return done(400);
        }
        // If the queryBody has been started already
        if (queryBody.length > 0) {
            // add an AND keyword for the next statement
            queryBody += " AND";
            // Otherwise
        } else {
            // Start the queryBody with a WHERE keyword
            queryBody += "WHERE";
        }
        // Add the query to the queryBody
        queryBody += "  modeCostRating<=" + queries["maxCostRating"];
    }
    // If adminId is a query option
    if (queries.hasOwnProperty("adminId")) {
        // If the queryBody has been started already
        if (queryBody.length > 0) {
            // add an AND keyword for the next statement
            queryBody += " AND";
            // Otherwise
        } else {
            // Start the queryBody with a WHERE keyword
            queryBody += "WHERE";
        }
        // Add the query to the queryBody
        queryBody += "  admin_id=" + queries["adminId"];
    }
    let sortBy = "ORDER BY ";
    // If sortBy is a query option
    if (queries.hasOwnProperty("sortBy")) {
        // If the sortBy query is DISTANCE
        if (queries["sortBy"] === "DISTANCE") {
            // If the latitude and longitude were also included
            if (queries.hasOwnProperty("myLatitude") && queries.hasOwnProperty("myLongitude")) { //TODO make these into a switch statement
                // Set the sortBy string to be empty as the sorting will be done in the javascript
                sortBy = "";
                // Set the sortByDistance boolean to true.
                sortByDistance = true;
                // Otherwise
            } else {
                // Return the done function with a 400 - Bad Request code
                return done(400);
            }
            // If the sortBy query is STAR_RATING
        } else if (queries["sortBy"] === "STAR_RATING") {
            // Concatenate meanStarRating to the sortBy string
            sortBy += "meanStarRating";
            // If the sortBy query is COST_RATING
        } else if (queries["sortBy"] === "COST_RATING") {
            // Concatenate modeCostRating to the sortBy string
            sortBy += "modeCostRating"
        }
        // Otherwise
    } else {
        // Default the sortBy string to meanStarRating
        sortBy += "meanStarRating";
    }
    // If reverseSort is a query option
    if (queries.hasOwnProperty("reverseSort")) {
        // If the reverseOrder query is true
        if (queries["reverseSort"] === "true") {
            // If the sortByDistance boolean is set to false
            if (!sortByDistance) {
                // Add DESC to the sortBy string
                if (sortBy === "ORDER BY modeCostRating") {
                    sortBy += " DESC";
                } else {
                    sortBy += " ASC";
                }
                // Otherwise
            } else {
                // Set the reverseOrder boolean to true
                reverseOrder = true;
            }
        }
    } else if (!sortByDistance) {
        if (sortBy === "ORDER BY modeCostRating") {
            sortBy += " ASC";
        } else {
            sortBy += " DESC";
        }
    }
    // Set the queryTemplate and concatenate the search options
    let queryTemplate = "SELECT venueId, venueName, categoryId, city, shortDescription, latitude, longitude, meanStarRating, modeCostRating, primaryPhoto\n" +
        "FROM (\n" +
        "SELECT\n" +
        "Venue.venue_id AS venueId, admin_id, Venue.venue_name AS venueName, " +
        "Venue.category_id AS categoryId, Venue.city, Venue.short_description AS shortDescription, Venue.latitude, " +
        "Venue.longitude, STAR_RATING AS meanStarRating, COST_RATING AS modeCostRating, " +
        "primaryPhoto\n" +
        "FROM\n" +
        "Venue LEFT JOIN (\n" +
        "SELECT\n" +
        "reviewed_venue_id, AVG(star_rating) AS STAR_RATING, ModeValues.COST_RATING\n" +
        "FROM\n" +
        "Review LEFT JOIN (\n" +
        "SELECT\n" +
        "Mode1.venue_id, Mode2.mode_cost_rating AS COST_RATING\n" +
        "FROM\n" +
        "ModeCostRating AS Mode1 JOIN\n" +
        "ModeCostRating AS Mode2 ON Mode1.venue_id=Mode2.venue_id\n" +
        "WHERE Mode2.mode_cost_rating >= Mode1.mode_cost_rating\n" +
        "GROUP BY Mode1.venue_id) AS ModeValues ON Review.reviewed_venue_id=ModeValues.venue_id\n" +
        "GROUP BY\n" +
        "reviewed_venue_id) AS Ratings ON Venue.venue_id=Ratings.reviewed_venue_id LEFT JOIN (\n" +
        "SELECT\n" +
        "venue_id, photo_filename AS primaryPhoto\n" +
        "FROM\n" +
        "VenuePhoto\n" +
        "WHERE\n" +
        "is_primary) AS Photos ON Photos.venue_id=Venue.venue_id) AS Results\n" +
        queryBody + "\n" + sortBy;
    try {
        // Call the database to return the results of the search
        let rows = await db.getPool().query(queryTemplate);
        // Set the start and count variables to thier defaults
        let start = 0;
        let count = rows.length;
        // If the query has a start index property
        if (queries.hasOwnProperty("startIndex")) {
            // Set the start index to the int value parsed from the query
            start = parseInt(queries["startIndex"]);
        }
        // If the query has a count property
        if (queries.hasOwnProperty("count")) {
            // Set the count value to the int value parsed from the query
            count = parseInt(queries["count"]);
        }
        // If the sortByDistance boolean is set to true
        if (queries.hasOwnProperty("myLatitude") && queries.hasOwnProperty("myLongitude")) {
            // Parse the latitude and longitude values from the query into floats
            let latitude2 = parseFloat(queries["myLatitude"]);
            let longitude2 = parseFloat(queries["myLongitude"]);
            // Iterate through the rows returned by the database
            for (let i = 0; i < rows.length; i++) {
                // Parse the latitude and longitude values from the database row into floats
                let latitude1 = parseFloat(rows[i]["latitude"]);
                let longitude1 = parseFloat(rows[i]["longitude"]);
                // Use the haversine function to calculate the distance
                let distance = haversine(longitude1, latitude1, longitude2, latitude2);
                // Add the distance to the row it was calculated from
                rows[i]["distance"] = (Math.round(distance * 1000) / 1000).toString();
            }
            if (sortByDistance) {
                // Call the sort function of arrays passing in a compare function
                await rows.sort(function (one, two) {
                    // Calculate the difference in the two distance values
                    let difference = parseFloat(one["distance"]) - parseFloat(two["distance"]);
                    // If the reverseOrder boolean is set to true
                    if (reverseOrder) {
                        // Multiply the difference by -1 and return it
                        return difference * -1;
                        // Otherwise
                    } else {
                        // Return the difference
                        return difference;
                    }
                });
            }
            // Return the done function with a 200 - OK code and the section of the rows requested
            let results = rows.splice(start, count);
            return done(200, results);
            // Otherwise
        } else {
            // Return the done function with a 200 - OK code and the section of the rows requested
            let results = rows.splice(start, count);
            return done(200, results);
        }
    } catch (error) {
        // Return the done function with a 400 - Bad Request code
        return done(400);
    }
};

exports.getCats = async function (done) {
    let rows;
    try {
        rows = await db.getPool().query('SELECT category_id AS categoryId, category_name AS categoryName, category_description AS categoryDescription FROM VenueCategory');
    } catch (error) {
        rows = [];
    }
    // Return the done function with the rows that the database returned
    return done(rows);
};

exports.getOne = async function (venueId, done) {
    let venueRows;
    try {
        // Call the database to get the venue data
        venueRows = await db.getPool().query('SELECT venue_name AS venueName, admin_id AS admin, category_id AS category, city, ' +
            'short_description AS shortDescription, long_description as longDescription, date_added AS dateAdded, ' +
            'address, latitude, longitude FROM Venue WHERE venue_id=?', [venueId])
    } catch (error) {
        return done(404);
    }
    // If the database returns an error or the rows are empty
    if (venueRows.length === 0) {
        // Return the done function with a 404 - Not Found code
        return done(404);
        // Otherwise
    } else {
        // Call the database to get the admin information
        let adminRows;
        try {
            adminRows = await db.getPool().query("SELECT user_id AS userId, username FROM User WHERE user_id=?", [venueRows[0]["admin"]]);
        } catch (error) {
            return done(404);
        }
        // If the database returns an error or the rows are empty
        if (adminRows.length === 0) {
            // Return the done function with a 404 - Not Found code
            return done(404);
            // Otherwise
        } else {
            let categoryRows;// Set the admin field in the venue rows to be the results.
            venueRows[0]["admin"] = adminRows[0];
            try {
                // Call the database to get the category information
                categoryRows = await db.getPool().query("SELECT category_id as categoryId, category_name AS categoryName, " +
                    "category_description AS categoryDescription FROM VenueCategory WHERE category_id=?", [venueRows[0]["category"]]);
            } catch (error) {
                return done(404);
            }
            // If the database returns an error or the rows are empty
            if (categoryRows.length === 0) {
                // Return the done function with a 404 - Not Found code
                return done(404);
                // Otherwise
            } else {
                // Set the category field in the venue rows to be the results
                venueRows[0]["category"] = categoryRows[0];
                let photoRows;
                try {// Call the database to get the venue photos
                    photoRows = await db.getPool().query("SELECT photo_filename as photoFilename," +
                        " photo_description AS photoDescription, is_primary AS isPrimary FROM VenuePhoto " +
                        "WHERE venue_id=?", [venueId]);
                } catch (error) {
                    return done(404);
                }
                // Set the isPrimary fields to be a boolean
                for (let i = 0; i < photoRows.length; i++) {
                    photoRows[i]["isPrimary"] = (photoRows[i]["isPrimary"] === 1);
                }
                // Set the photos field in the venue rows to be the results
                venueRows[0]["photos"] = photoRows;
                // Return the done function with a 200 - OK code and the results
                return done(200, venueRows[0]);
            }
        }
    }
};

exports.insert = async function (authToken, venueData, done) {
    // Put the new venue data into an array ready for the database to insert.
    let values = [
        [venueData["venueName"]],
        [venueData["categoryId"]],
        [venueData["city"]],
        [venueData["shortDescription"]],
        [venueData["longDescription"]],
        [venueData["address"]],
        [venueData["latitude"]],
        [venueData["longitude"]
        ]
    ];
    // If any of the necessary values are missing or incorrect
    if (!(venueData.hasOwnProperty("venueName") && typeof venueData["venueName"] === typeof "" && venueData["venueName"].length !== 0) ||
        !(venueData.hasOwnProperty("categoryId") && typeof venueData["categoryId"] === "number") ||
        !(venueData.hasOwnProperty("city") && typeof venueData["city"] === typeof "" && venueData["city"].length !== 0) ||
        !(venueData.hasOwnProperty("shortDescription") && typeof venueData["shortDescription"] === typeof "" && venueData["shortDescription"].length !== 0) ||
        !(venueData.hasOwnProperty("longDescription") && typeof venueData["longDescription"] === typeof "" && venueData["longDescription"].length !== 0) ||
        !(venueData.hasOwnProperty("address") && typeof venueData["address"] === typeof "" && venueData["address"].length !== 0) ||
        !(venueData.hasOwnProperty("latitude") && typeof venueData["latitude"] === "number") || Math.abs(parseFloat(venueData["latitude"])) > 90 ||
        !(venueData.hasOwnProperty("longitude") && typeof parseFloat(venueData["longitude"]) === "number") || Math.abs(parseFloat(venueData["longitude"])) > 180) {
        // Return the done function with a 400 - Bad Request code
        return done(400);
        // Otherwise
    } else {
        let categoryRows;
        try {
            // Call the database to get the category Id
            categoryRows = await db.getPool().query("SELECT * FROM VenueCategory WHERE category_id=?", [venueData["categoryId"]]);
        } catch (error) {
            console.log(error);
        }
        // If the category does not exist (the rows are empty)
        if (categoryRows.length === 0) {
            // Return the done function with a 400 - Bad Request code
            return done(400);
        }
        // If the auth header type is not undefined
        if (authToken === undefined) {
            return done(401);
        }
        let userRows;
        try {
            // Call the database to retrieve the user associated with this token
            userRows = await db.getPool().query("SELECT user_id as userId FROM User WHERE auth_token=?", [authToken]);
        } catch (error) {
            userRows = [];
        }
        // If the rows are empty (there is no user logged in with this token)
        if (userRows.length === 0) {
            // Return the done function with a 403 - Unauthorized code
            return done(401);
            // Otherwise
        } else {
            // Extract the user id from the rows
            let userId = userRows[0]["userId"];
            // Get the current time
            let currentDate = new Date();
            // Push the userId and the current date onto the values array
            values.push([userId]);
            values.push([currentDate]);
            let insertRows;
            try {
                // Call the database to insert the new venue
                insertRows = await db.getPool().query("INSERT INTO Venue (venue_name, category_id, city, short_description, long_description, address, latitude, longitude, admin_id, date_added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", values);
            } catch (error) {
                // Return the done function with a 400 - Bad Request code
                return done(400);
            }
            // Return the done function with a 201 - Created code and an object containing the new venue id
            return done(201, {"venueId": insertRows["insertId"]});
        }
    }
};

let validateField = function (venueData, queryData, fieldCamel, fieldDatabase, isNumeric) {
    // If the venue name is to be changed
    if (venueData.hasOwnProperty(fieldCamel)) {
        // If the query already has a valid request field
        if (queryData.isValidRequestField) {
            // Add a coma separator to the query
            queryData.updateQuery += ", ";
        } else {
            // Set valid request to true
            queryData.isValidRequestField = true;
        }
        // Add the field to the query
        // If the field is numeric
        if (isNumeric) {
            queryData.updateQuery += fieldDatabase + "=" + venueData[fieldCamel];
        } else {
            queryData.updateQuery += fieldDatabase + "=\"" + venueData[fieldCamel] + '"';
        }
    }
    return queryData;
};

exports.alter = async function (authToken, venueData, venueId, done) {
    // Initialize a boolean variable isValidRequestField to false and an update query in an object
    let queryData = {
        "isValidRequestField": false,
        "updateQuery": "UPDATE Venue SET "
    };
    // Define a userId variable
    let userId;
    // If the auth token doesn't exist
    if (authToken === undefined) {
        // Return the done function with a 401 - Unauthorized code
        return done(401);
    }
    let userRows;
    try {
        // Call the database to retrieve the user logged in with the given token
        userRows = await db.getPool().query("SELECT user_id AS userId FROM User WHERE auth_token=?", [authToken]);
    } catch (error) {
        // Return the done function with a 400 - Bad Request code
        return done(400);
    }
    // If the returned rows are empty
    if (userRows.length === 0) {
        // Return the done function with a 401 - Unauthorized code
        return done(401);
    }
    // Set the user id from the database to a variable
    userId = userRows[0]["userId"];
    let venueRows;
    try {
        // Call the database to check if the venue exists
        venueRows = await db.getPool().query("SELECT admin_id AS adminId FROM Venue WHERE venue_id=?", [venueId]);
    } catch (error) {
        // Return the done function with a 400 - Bad Request code
        return done(400);
    }
    // if the database returns no venues
    if (venueRows.length === 0) {
        // Return the done function with a 404 - Not Found code
        return done(404);
        // If the user is not the admin of this venue
    } else if (userId !== venueRows[0]["adminId"]) {
        console.log(userId);
        console.log(venueRows[0]["adminId"]);
        // Return the done function with a 403 - Forbidden code
        return done(403);
        // Otherwise
    } else {
        // Check which fields are going to be updated and put in the the query
        queryData = validateField(venueData, queryData, "venueName", "venue_name", false);
        queryData = validateField(venueData, queryData, "categoryId", "category_id", true);
        queryData = validateField(venueData, queryData, "city", "city", false);
        queryData = validateField(venueData, queryData, "shortDescription", "short_description", false);
        queryData = validateField(venueData, queryData, "longDescription", "long_description", false);
        queryData = validateField(venueData, queryData, "address", "address", false);
        queryData = validateField(venueData, queryData, "latitude", "latitude", true);
        queryData = validateField(venueData, queryData, "longitude", "longitude", true);
        // finish the query
        queryData.updateQuery += " WHERE venue_id=?";
        // Call the database to update the venue details
        try {
            db.getPool().query(queryData.updateQuery, [venueId]);
        } catch (error) {
            // Return the done function with a 400 - Bad Request code
            return done(400);
        }
        // Return the done function with a 200 - OK code
        return done(200);
    }
};
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

exports.getVenues = function(queries, done) {
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
        queryBody += " venueName LIKE '%" + queries["q"] + "%'"; // TODO what is the title? name or desription?
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
        queryBody += " category_id=" + queries["categoryId"];
    }
    // If minStarRating is a query option
    if (queries.hasOwnProperty("minStarRating")) {
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
    if (queries.hasOwnProperty( "maxCostRating")) {
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
                sortBy += " DESC";
                // Otherwise
            } else {
                // Set the reverseOrder boolean to true
                reverseOrder = true;
            }
        }
    }
    // Set the queryTemplate and concatenate the search options
    let queryTemplate = "SELECT *\n" +
        "FROM (\n" +
            "SELECT\n" +
            "Venue.venue_id AS venueId, Venue.venue_name AS venueName, " +
            "Venue.category_id AS categoryId, Venue.city, Venue.short_description AS shortDescription, Venue.latitude, " +
            "Venue.longitude, COALESCE(STAR_RATING, 0 ) AS meanStarRating, COALESCE(COST_RATING, 0) AS modeCostRating, " +
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
                    "venue_id, COALESCE(photo_filename, '') AS primaryPhoto\n" +
                    "FROM\n" +
                    "VenuePhoto\n" +
                    "WHERE\n" +
                    "is_primary) AS Photos ON Photos.venue_id=Venue.venue_id) AS Results\n" +
        queryBody + "\n" + sortBy;
    // Call the database to return the results of the search
    db.getPool().query(queryTemplate, function (err, rows) {
        // If the database returns an error
        if (err) {
            // Return the done function with a 400 - Bad Request code
            return done(400);
        } else {
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
            if (sortByDistance) {
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
                // Call the sort function of arrays passing in a compare function
                rows.sort(function (one, two) {
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
                // Return the done function with a 200 - OK code and the section of the rows requested
                return done(200, rows.splice(start, count));
                // Otherwise
            } else {
                // Return the done function with a 200 - OK code and the section of the rows requested
                return done(200, rows.splice(start, count));
            }
        }
    });
};

exports.getCats = function(done) {
    db.getPool().query('SELECT * FROM VenueCategory', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.getOne = function(venueId, done) {
    db.getPool().query('SELECT * FROM Venue where venue_id = ?', venueId, function(err, rows) {
        if (err) return done(err);
        done(rows);
    });
};

exports.insert = function(values, done) {

    db.getPool().query('INSERT INTO Venue (venue_name, category_id, city, short_description, long_description, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?', values, function(err, result) {

        if (err) return done(err);

        done(result);
    });
};

exports.alter = function(values, done) {
    db.getPool().query('UPDATE Venue SET venue_name = ?, category_id = ?, city = ?, short_description = ?, long_description = ?, address = ?, latitude = ?, longitude = ?) WHERE venue_id = ?', values, function(err, result) {

        if (err) return done(err);

        done(result);
    });
};
// sqlite3 package used to create an sqlite database
const sqlite3 = require("sqlite3").verbose();

// create an sqlite database in-memory
const db = new sqlite3.Database(':memory:');

// express package used to create a server
const express = require('express');

// create an express instance to define our server
const app = express();

// include cors to allow for requests from our ReactJS app running on a different port
const cors = require('cors');

// accept requests from any origin
app.use(cors({origin: '*'}));

// startup a collection of data to manage
db.serialize(function(){

  // create a fresh version of the table
  db.run("DROP TABLE IF EXISTS Inventory");
  db.run("CREATE TABLE Inventory (animal TEXT, description TEXT, " +
  	     "age INTEGER, price REAL)");

  // insert initial records into the table
  var stmt = db.prepare("INSERT INTO Inventory VALUES (?,?,?,?)");
  stmt.run("Dog", "Wags tail when happy", "2", "250.00");
  stmt.run("Cat", "Black colour, friendly with kids", "3", "50.00");
  stmt.run("Love Bird", "Blue with some yellow", "2", "100.00");
  stmt.finalize();

});

// Make the backend available at localhost:3001/api
app.get("/api",
  function(req,res)
  {
	
	// log to console that an api request has been received
    console.log("API REQUEST RECEIVED");
	
	// return all of the animals in the inventory as a JSON array
	if (req.query.act == "getall")
	{

  	  db.all("SELECT rowid as id, animal, description, age, price FROM Inventory",
  		     function(err, results)
  		     {
			   if (err) 
			   {
				   // console log error, return JSON error message
				   console.log(err);
				   res.json({"error" : "Could not get inventory"});
			   }
			   else {
                 // send debug info to console
                 console.log(JSON.stringify(results));
  
                 // send back table data as JSON data
                 res.json(results);
				 
			   }  
  		     });
	}
	
	// add an animal to the inventory
	else if (req.query.act == "add")
	{
		db.run("INSERT INTO Inventory(animal,description,age,price) VALUES (?,?,?,?)", 
		       [req.query.animal, 
			   req.query.description,
			   req.query.age, 
			   req.query.price],
			   function(err, results) 
			   {
				   if (err) 
				   {
					   // console log error, return JSON error message
					   console.log(err);
					   res.json({"error" : "Could not insert animal"});
				   }
				   else
				   {
				     console.log(results);
					 res.json({"status" : "Add animal successful"});
				   }
				    
			   });
		   
	}
	
	// delete an animal from the inventory
	else if (req.query.act == "delete")
	{
		db.run("DELETE FROM Inventory WHERE rowid=?", 
		       [req.query.id],
			   function(err, results) 
			   {
				   if (err) 
				   {
					   // console log error, return JSON error message
					   console.log(err);
					   res.json({"error" : "Could not delete animal"});
				   }
				   else
				   {
				     console.log(results);
					 res.json({"status" : "Delete animal successful"});
				   }
				    
			   });
		   
	}	

    // update an animal in the inventory
	else if (req.query.act == "update")
	{
		db.run("UPDATE Inventory SET animal=(?), description=(?), " +
		       "age=(?), price=(?) WHERE rowid=?", 
		       [req.query.animal, 
			    req.query.description,
			    req.query.age, 
			    req.query.price,
			    req.query.id],
			   function(err, results) 
			   {
				   if (err) 
				   {
					   // console log error, return JSON error message
					   console.log(err);
					   res.json({"error" : "Could not update animal"});
				   }
				   else
				   {
				     console.log(results);
					 res.json({"status" : "Update animal successful"});
				   }
				    
			   });
		   
	}	
	
	// search the inventory... search all fields that contain a provided term
	else if (req.query.act == "search")
	{

  	  db.all("SELECT rowid as id, animal, description, age, price FROM Inventory " +
	         "WHERE rowid LIKE '%" + req.query.term  + "%' OR animal LIKE '%" + req.query.term + 
             "%' OR description LIKE '%" + req.query.term + "%' OR " +
			 "age LIKE '%" + req.query.term  + "%' OR price LIKE '%" + req.query.term  + "%'",
  		     function(err, results)
  		     {
			   if (err) 
			   {
				   console.log(err);
				   res.json({"error" : "Could not search inventory"});
			   }
			   else {
                 // send debug info to console
                 console.log(JSON.stringify(results));
  
                 // send back table data as JSON data
                 res.json(results);
				 
			   }  
  		     });
	}	
	
	// if no act is found
	else 
	{
	  res.json({'error': 'act not found'});	
	}		 

});

// catch all case if no route found
app.get('*',function (req, res) {
  res.json({'error': 'route not found'});
});

// run the server
const server = app.listen(3001, function(){
  console.log("Pet Store Inventory Server listening on port 3001!")
});


var express = require('express');
var router = express.Router();
var request = require('request');
var OAuth = require('oauth-request');


//web app environment- 

var qs			= require('querystring');

// ================================================================================================


/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    var db = req.db;
    db.collection('userlist').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, respo) {
    var db = req.db;
    var parmAdd = req.body;
    var parmAdd1 = JSON.stringify(parmAdd);
    console.log('parmAdd = ' + parmAdd1);
    
    
    //pulse the repository with parameter -- and display json object on the console.
    var userName = parmAdd.username;
    var oauth = parmAdd.oauth;
    console.log('user name = '  + userName + ' oauth = ' + oauth);
    
    
    
//=============================================================================================================================================
    
    // Hard coded with my (badradley)'s public and secret
    // In future can grab these values from the prompt boxes that pop up when adding a user with oauth
    var publicKey = 'S7WnWhrAxreD8K766s';
    var secretKey = 'kz6GNh9GgbyTtu3wZHBPBTGbBEjPHZGg';
    
    // If Oauth is being used
    if (oauth == 'y' || oauth == 'Y') {
	    // Optional Oauth call to BitBucket if user has authorized private data to be retrieved
	    // Insert users two keys in the public and secret slots below    	
    	
	    // Users' two keys
	    var bit = OAuth({
	        consumer: {
	            public: publicKey,
	            secret: secretKey
	        }
	    });
	    
	    // If Tokens are required~~~~~~~~~~~~~~~~~~~~~~~~~~~
	    /*
	    bit.setToken({
	        public: 'S7WnWhrAxreD8K766s',
	        secret: 'kz6GNh9GgbyTtu3wZHBPBTGbBEjPHZGg'
	    });
	    *///~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	    
	    // Api call to retrieve users information from BitBucket, returned in JSON form
	    bit.get({
	        url: 'https://api.launchpad.net/1.0/~' + userName,
	        qs: {
	            count: 5
	        },
	        json: true
	    }, function(err, res, body) {
	    	
	    	if (!err && res.statusCode === 200) {
		    	// Adding three fields to the returned JSON object for my own purposes
		    	body.usingOauth = 'Yes';
		    	body.source = 'launchpad';
		        console.log(body);
		        
		        // Inserting the JSON object into our 'userlist' Mongo db database
			    db.collection('userlist').insert(body, function(err, result) {
		            if (err) console.log(err);
		            
		            // If object successfully added, say so
		            console.log("record added");
		            
		            respo.send((err === null) ? {msg: ''} : {msg: err});
		        });
	    	}
	    	else	    		
	    		console.log("User does not exist.");
	    });
    }
	 
    // If Oauth is not being used
	else {
	    //=============================================================================================================================================
	    
	    // The request method that will make the http call to the bitbucket api for accessing a username
	    request('https://api.launchpad.net/1.0/~' + userName, function (error, response, body) {
			if (!error && response.statusCode === 200) {			    
			    
			    // Transforming the json string sent back from the api call into a true JSON object
			    var jbody = JSON.parse(body);
			    console.log("\n" + typeof(jbody));
			    
			    // Adding three fields to the returned JSON object for my own purposes
			    jbody.usingOauth = "No";
			    jbody.source = 'launchpad';
			    
			    // Presents the JSON in a human readable form to console		    
				var sjbody = JSON.stringify(jbody, undefined, 1);
			    console.log("\n" + sjbody);

			    // Inserting the JSON object into our 'userlist' Mongo db database
			    db.collection('userlist').insert(jbody, function(err, result) {
	                if (err) console.log(err);
	                
	                // If object successfully added, say so
	                console.log("record added");
	                
	                respo.send((err === null) ? {msg: ''} : {msg: err});
	            });
			}
			
			// If the user does not exist on BitBucket display this message
			else
			  console.log("User does not exist.");
		})
	}
});

/*
 * DELETE to deleteuser.
 */

router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('userlist').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;
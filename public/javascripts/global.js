// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();

    // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Add User button click
    $('#btnAddUser').on('click', addUser);    

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

});

// Functions =============================================================

// Fill table with data
function populateTable() {
	
	
    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {

        // Populate the global variable userListData with the data retrieved from MongoDB
        userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.name + '" title="Show Details">' + this.name + '</a></td>';
            tableContent += '<td>' + this.display_name + '</td>';
            tableContent += '<td>' + this.usingOauth + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });
        
        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
        
        
    });    
};

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.name; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];    
    
    
    // Fill Static Box~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~    
    $('#displayName').text(thisUserObject.display_name);
    $('#description').text(thisUserObject.description);
    $('#dateCreated').text(thisUserObject.date_created);
    $('#private').text(thisUserObject.private);
    $('#visability').text(thisUserObject.visability);
    $('#latitude').text(thisUserObject.latitude);
    $('#longitude').text(thisUserObject.longitude);
    $('#valid').text(thisUserObject.is_valid);
    $('#karma').text(thisUserObject.karma);
    $('#timeZone').text(thisUserObject.time_zone);
    $('#hideEmail').text(thisUserObject.hide_email_addresses);
    $('#httpetag').text(thisUserObject.http_etag);
    $('#probationary').text(thisUserObject.is_probationary);
    $('#teamMember').text(thisUserObject.is_team);
    $('#ubuntuCoc').text(thisUserObject.is_ubuntu_coc_signer);
    $('#mailingListSubscribe').text(thisUserObject.mailing_list_auto_subscribe_policy);
    
    // Fill Link Box~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    $('#mugshot').text(thisUserObject.mugshot_link);
    $('#logo').text(thisUserObject.logo_link);
    $('#preferredEmail').text(thisUserObject.preferred_email_address_link);
    $('#otherEmail').text(thisUserObject.confirmed_email_address_collection_link);
    $('#languages').text(thisUserObject.languages_collection_link);
    $('#recipes').text(thisUserObject.recipes_collection_link);
    $('#resources').text(thisUserObject.resource_type_link);
    $('#admins').text(thisUserObject.admins_collection_link);
    $('#archive').text(thisUserObject.archive_link);
    $('#deactivatedMembers').text(thisUserObject.deactivated_members_collection_link);
    $('#expiredMembers').text(thisUserObject.expired_members_collection_link);
    $('#gpgKeys').text(thisUserObject.gpg_keys_collection_link);
    $('#hardwareSubmissions').text(thisUserObject.hardware_submissions_collection_link);
    $('#invitedMembers').text(thisUserObject.invited_members_collection_link);
    $('#ircNicknames').text(thisUserObject.irc_nicknames_collection_link);
    $('#jabberIds').text(thisUserObject.jabber_ids_collection_link);
    $('#members').text(thisUserObject.members_collectioin_link);
    $('#memberDetails').text(thisUserObject.member_details_collection_link);
    $('#membershipInvitations').text(thisUserObject.open_membership_invitations_collection_link);
    $('#participants').text(thisUserObject.participants_collection_link);
    $('#ppas').text(thisUserObject.ppas_collection_link);
    $('#proposedMembers').text(thisUserObject.proposed_member_collection_link);
    $('#selfLink').text(thisUserObject.self_link);
    $('#sshKeys').text(thisUserObject.sshkeys_collection_link);
    $('#subTeams').text(thisUserObject.sub_teams_collection_link);
    $('#superTeams').text(thisUserObject.super_teams_collection_link);
    $('#teamOwner').text(thisUserObject.team_owner_link);
    $('#webLink').text(thisUserObject.web_link);
    $('#wikiNames').text(thisUserObject.wiki_names_collection_link);
    	
    
    
};

// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank    
    var errorCount = 0;
    $('#addUser fieldset #inputUserName').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });
    $('#addUser fieldset #inputUserEmail').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });
    
    // If we are using oauth for user, send prompts to input user public and secret
    $('#addUser fieldset #inputOauth').each(function(index, val) {
    	if($(this).val() == 'y' || $(this).val() == 'Y') {prompt("Enter user's Public","public"); prompt("Enter User's Secret", "secret");}    	
    });

    
    
    // Check and make sure errorCount's still at zero or 1
    if(errorCount === 0 || errorCount === 1) {

        // If it is, compile search parameters into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'oauth': $('#addUser fieldset input#inputOauth').val()
        }
        
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {
        	
        	
            // Check for successful (blank) response
            if (response.msg == '') {

                // Clear the form inputs
                $('#addUser fieldset input#inputUserName').val('');
                $('#addUser fieldset input#inputUserEmail').val('');
                $('#addUser fieldset input#inputOauth').val('');

                // Update the table
                populateTable();                
            }
            else           	
                alert('Error: ' + response.msg);           
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please specify a username or email to look up');
        return false;
    }
};

// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();            
        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};
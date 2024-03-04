document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit Handler
  document.querySelector("#compose-form").addEventListener('submit', send_mail)

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-detail-view').style.display = 'block';

      document.querySelector('#email-detail-view').innerHTML = `
              <div class="email-body">
                <div class="email-body-item"><strong>From: </strong>${email.sender}</div>
                <div class="email-body-item"><strong>To: </strong>${email.recipients}</div>
                <div class="email-body-item"><strong>Subject: </strong>${email.subject}</div>
                <div class="email-body-item"><strong>Timestamp: </strong>${email.timestamp}</div>
                <hr>
                <div class="email-body-body">${email.body}</div>
              </div>
              `;



      const user_action = document.createElement('div');
      user_action.className = "user-action";
      user_action.id = "user-actions";
      document.querySelector('#email-detail-view').append(user_action);


      // Reply Logic
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply";
      btn_reply.className = "btn btn-info";
      btn_reply.addEventListener('click', function () {
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject;
        if (subject.split('', 1)[0] != "Re:") {
          subject = "Re: " + email.subject;
        }
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.querySelector('#user-actions').append(btn_reply);

      //  // Arhive and Unarchive Logic
      //  const btn_arch = document.createElement('button');
      //  btn_arch.innerHTML = email.archived ? "Unarchive" : "Archive";
      //  btn_arch.className = email.archived ? "btn btn-success" : "btn btn-danger";
      //  btn_arch.addEventListener('click', function () {
      //    fetch(`/emails/${email.id}`, {
      //      method: 'PUT',
      //      body: JSON.stringify({
      //        archived: !email.archived
      //      })
      //    })
      //      .then(() => { load_mailbox('archive') })
      //  });
      //  document.querySelector('#user-actions').append(btn_arch);
      // Archive and Unarchive Logic
      const archiveButton = document.createElement('button');
      archiveButton.innerHTML = email.archived ? "Unarchive" : "Archive";
      archiveButton.className = email.archived ? "btn btn-success" : "btn btn-danger";
      archiveButton.addEventListener('click', function () {
        const isArchived = !email.archived;

        // Update the button state immediately
        archiveButton.innerHTML = isArchived ? "Unarchive" : "Archive";
        archiveButton.className = isArchived ? "btn btn-success" : "btn btn-danger";

        // Update the server with the new archived status
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: isArchived
          })
        })
          .then(response => response.json())
          .then(updatedEmail => {
            // Handle the response if needed
            console.log(updatedEmail);
            load_mailbox('archive');
          })
          .catch(error => {
            console.error('Error updating archive status:', error);
          });
      });
      document.querySelector('#user-actions').append(archiveButton);
    });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';


  // Show the mailbox name

  const mailboxName = document.createElement('div');
  mailboxName.className = "mailbox-name";
  mailboxName.id = "mailbox-names";

  document.querySelector('#emails-view').append(mailboxName);

  document.querySelector('#mailbox-names').innerHTML = `<p>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</p>`;

  // create
  const emailbox = document.createElement('div');
  emailbox.className = "email-box";
  emailbox.id = "email-boxes";

  document.querySelector('#emails-view').append(emailbox);


  // Get the emails for that mailbox and user
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Loop through emails and create a div for each

      emails.forEach(singleEmail => {
        console.log(singleEmail);



        // create a div for each email
        const newEmail = document.createElement('div');
        // newEmail.className = "list-group-item";
        newEmail.innerHTML = `
        
                <div class="grid-container">
                  <div class="grid-item">${singleEmail.sender}</div>
                  <div class="grid-item">${singleEmail.subject}</div>
                  <div class="grid-item">${singleEmail.timestamp}</div>   
                </div>
                `;



        // Add click event
        newEmail.addEventListener('click', function () {
          view_email(singleEmail.id);

          // Toggle read/unread status and change color
          const isRead = !singleEmail.read;
          fetch(`/emails/${singleEmail.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: isRead
            })
          });

          // Change color based on read/unread status
          newEmail.className = isRead ? 'read' : 'unread';
        });

        // Set initial color based on read/unread status
        newEmail.className = singleEmail.read ? 'read' : 'unread';
        document.querySelector('#email-boxes').append(newEmail);


      });
    });
}

function send_mail(event) {
  event.preventDefault();

  //Store fields
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //make a POST request or Send data to server/backend
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log('Email sent successfully', result);
      load_mailbox('sent');
    })
    .catch(error => {
      console.log('Error sending mail', error);
    });
}










// -------------------
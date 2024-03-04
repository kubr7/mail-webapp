document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document.querySelector("#inbox").addEventListener("click", () => loadMailbox("inbox"));
  document.querySelector("#sent").addEventListener("click", () => loadMailbox("sent"));
  document.querySelector("#archived").addEventListener("click", () => loadMailbox("archive"));
  document.querySelector("#compose").addEventListener("click", composeEmail);

  // Submit Handler
  document.querySelector("#compose-form").addEventListener("submit", sendMail);

  // By default, load the inbox
  loadMailbox("inbox");
});

// ----------


function composeEmail() {
  // Show compose view and hide other views
  document.querySelector("#emails-views").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#email-detail-view").style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function viewEmail(id) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      // Print email
      // console.log(email);
      document.querySelector("#emails-views").style.display = "none";
      document.querySelector("#compose-view").style.display = "none";
      document.querySelector("#email-detail-view").style.display = "block";

      document.querySelector("#email-detail-view").innerHTML = `
      <div class="email-body">
        <div class="email-body-item"><strong>From: </strong>${email.sender}</div>
        <div class="email-body-item"><strong>To: </strong>${email.recipients}</div>
        <div class="email-body-item"><strong>Subject: </strong>${email.subject}</div>
        <div class="email-body-item"><strong>Timestamp: </strong>${email.timestamp}</div>
        <hr>
        <div class="email-body-body">${email.body}</div>
      </div>
      `;

      const user_action = document.createElement("div");
      user_action.className = "user-action";
      user_action.id = "user-actions";
      document.querySelector("#email-detail-view").append(user_action);

      // Reply Logic
      const btn_reply = document.createElement("button");
      btn_reply.innerHTML = "Reply";
      btn_reply.className = "reply-btn";
      btn_reply.addEventListener("click", function () {
        composeEmail();

        document.querySelector("#compose-recipients").value = email.sender;
        let subject = email.subject;
        if (subject.split("", 1)[0] != "Re:") {
          subject = "Re: " + email.subject;
        }
        document.querySelector("#compose-subject").value = subject;
        document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.querySelector("#user-actions").append(btn_reply);

      // Arhive and Unarchive Logic
      const btn_arch = document.createElement("button");
      btn_arch.innerHTML = email.archived ? "Unarchive" : "Archive";
      btn_arch.className = email.archived ? "unarchive-btn" : "archive-btn";
      btn_arch.addEventListener("click", function () {
        fetch(`/emails/${email.id}`, {

          method: "PUT",
          body: JSON.stringify({
            archived: !email.archived,
          }),
        }).then(() => {
          loadMailbox("archive");
        });
      });
      document.querySelector("#user-actions").append(btn_arch);

      // Delete button
      const btn_del = document.createElement("button");
      btn_del.innerHTML = "Delete";
      btn_del.classList.add("delete-btn", "action-btn");

      btn_del.addEventListener("click", function () {
        fetch(`/emails/${email.id}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(() => {
          // Determine the mailbox type based on the current view
          const currentMailbox = document.querySelector("#emails-view p").textContent.toLowerCase();

          // Remove the email from the DOM if it exists
          const emailElement = document.querySelector(`#emails-${email.id}`);
          if (emailElement) {
            emailElement.remove();
          }

          // Optionally, you can reload the mailbox after deleting the email
          loadMailbox(currentMailbox);
        });
      });

      document.querySelector("#user-actions").append(btn_del);

    });
}

function loadMailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-views").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-detail-view").style.display = "none";


  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<p>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</p>`;

  // Clear existing emails before fetching and appending new ones
  document.querySelector("#eachEmails-views").innerHTML = '';

  // Fetch emails for the specified mailbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {

      // Loop through emails and create a div for each
      emails.forEach((singleEmail) => {
        // create a div for each email
        const newEmail = document.createElement("div");
        newEmail.innerHTML = `
          <div class="grid-container">
            <div class="grid-item">
              <input type="checkbox" name="selected_mails" class="myCheck" onclick="myFunction()">
            </div>            
            <div class="grid-item">${singleEmail.sender}</div>
            <div class="grid-item">${singleEmail.subject}</div>
            <div class="grid-item">${singleEmail.timestamp}</div>   
          </div>
        `;

        // Set initial color based on read/unread status
        newEmail.className = singleEmail.read ? "read" : "unread";

        // Update click event for each email div
        newEmail.addEventListener("click", function (event) {
          // Prevent checkbox click from triggering the email div click event
          if (event.target.type !== "checkbox") {
            viewEmail(singleEmail.id);

            // Toggle read/unread status and change color
            const isRead = !singleEmail.read;
            fetch(`/emails/${singleEmail.id}`, {
              method: "PUT",
              body: JSON.stringify({
                read: isRead,
              }),
            });

            // Change color based on read/unread status
            newEmail.className = isRead ? "read" : "unread";

            // Update the global variable for checkbox state
            checkboxesChecked = false;
          }
        });

        // Append the email div to the emails-view
        document.querySelector("#eachEmails-views").append(newEmail);
      })
    })
    .catch((error) => {
      console.error("Error fetching emails:", error);
    });

    function del(id) {
      fetch(`/emails/${singleEmail.id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(() => {
        // Determine the mailbox type based on the current view
        const currentMailbox = document.querySelector("#emails-view p").textContent.toLowerCase();
    
        // Remove the email from the DOM if it exists
        const emailElement = document.querySelector(`#emails-${singleEmail.id}`);
        if (emailElement) {
          emailElement.remove();
        }
    
        // Optionally, you can reload the mailbox after deleting the email
        loadMailbox(currentMailbox);
      });
    }
}

function sendMail(event) {
  event.preventDefault();

  //Store fields
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  //make a POST request or Send data to server/backend
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log("Email sent successfully", result);
      loadMailbox("sent");
    })
    .catch((error) => {
      console.log("Error sending mail", error);
    });
}

// Global variable to track the checkbox state
let checkboxesChecked = false;

function myFunction() {
  // Get all checkboxes on the page
  var checkboxes = document.querySelectorAll("input[type='checkbox']");

  // Get the output options
  var options = document.getElementById("actions");

  // Check if any checkbox is checked
  checkboxesChecked = Array.from(checkboxes).some(function (checkbox) {
    return checkbox.checked;
  });

  // Set options.style.display based on checkboxesChecked
  options.style.display = checkboxesChecked ? "flex" : "none";
}

// Reset checkboxesChecked to false when any click event occurs
document.addEventListener("click", function (event) {
  // Get the target element of the click event
  const target = event.target;

  // If the click event is not on a checkbox, set checkboxesChecked to false
  if (target.type !== "checkbox") {
    checkboxesChecked = false;

    // Set options.style.display to "none"
    var options = document.getElementById("actions");
    options.style.display = "none";
  }
});

function changePlaceholder() {
  document.getElementById("compose-recipients").placeholder = "To:";
}





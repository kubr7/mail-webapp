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

function composeEmail() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#email-detail-view").style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function view_email(id) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      // Print email
      console.log(email);
      document.querySelector("#emails-view").style.display = "none";
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
      btn_reply.className = "btn btn-info";
      btn_reply.addEventListener("click", function () {
        composeEmail();

        document.querySelector("#compose-recipients").value = email.sender;
        let subject = email.subject;
        if (subject.split("", 1)[0] != "Re:") {
          subject = "Re: " + email.subject;
        }
        document.querySelector("#compose-subject").value = subject;
        document.querySelector(
          "#compose-body"
        ).value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.querySelector("#user-actions").append(btn_reply);

      // Arhive and Unarchive Logic
      const btn_arch = document.createElement("button");
      btn_arch.innerHTML = email.archived ? "Unarchive" : "Archive";
      btn_arch.className = email.archived
        ? "btn btn-success"
        : "btn btn-danger";
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
    });
}

function loadMailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-detail-view").style.display = "none";

  // Show the mailbox name

  document.querySelector("#emails-view").innerHTML = `<p>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</p>`;

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
            <div class="grid-item"><label><input type="checkbox" name="selected_mails" value="${singleEmail.id}"></label></div>
            <div class="grid-item">${singleEmail.sender}</div>
            <div class="grid-item">${singleEmail.subject}</div>
            <div class="grid-item">${singleEmail.timestamp}</div>   
          </div>
        `;

        // Add click event
        // newEmail.addEventListener("click", function () {
        //   view_email(singleEmail.id);

        //   // Toggle read/unread status and change color
        //   const isRead = !singleEmail.read;
        //   fetch(`/emails/${singleEmail.id}`, {
        //     method: "PUT",
        //     body: JSON.stringify({
        //       read: isRead,
        //     }),
        //   });

        //   // Change color based on read/unread status
        //   newEmail.className = isRead ? "read" : "unread";
        // });

        // Track selected emails
        const selectedEmails = new Set();

        // Update click event for each email div
        newEmail.addEventListener("click", function (event) {
          // Prevent checkbox click from triggering the email div click event
          if (event.target.type !== "checkbox") {
            view_email(singleEmail.id);

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
          }
        });

        // Update the checkbox click event
        const checkbox = newEmail.querySelector("input[type='checkbox']");
        checkbox.addEventListener("click", function (event) {
          // Prevent the email div click event when the checkbox is clicked
          event.stopPropagation();

          // Track selected emails
          if (checkbox.checked) {
            selectedEmails.add(singleEmail.id);
          } else {
            selectedEmails.delete(singleEmail.id);
          }
        });

        // Add a function to perform actions on selected emails
        function performActionsOnSelectedEmails(action) {
          // Check if any emails are selected
          if (selectedEmails.size > 0) {
            // Send a POST request to the server to perform the selected action
            fetch("/emails/actions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
              },
              body: JSON.stringify({
                action: action,
                email_ids: Array.from(selectedEmails),
              }),
            })
              .then((response) => response.json())
              .then((result) => {
                // Handle the result (e.g., refresh mailbox)
                console.log(result);
                loadMailbox("inbox");
              })
              .catch((error) => {
                console.error("Error performing action:", error);
              });
          } else {
            console.log("No emails selected");
          }
        }

        // Helper function to get CSRF token from cookies
        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
        }

        // Set initial color based on read/unread status
        newEmail.className = singleEmail.read ? "read" : "unread";

        // Append the email div to the emails-view
        document.querySelector("#emails-view").append(newEmail);
      });
    })
    .catch((error) => {
      console.error("Error fetching emails:", error);
    });
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
      body: body,
    }),
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

// Inside the event listener for the form submission
document.querySelector("#compose-form").addEventListener("submit", function (event) {
  event.preventDefault();
  sendMail();
});

// Add an event listener for the form containing checkboxes and buttons
document.querySelector("#emails-view form").addEventListener("submit", function (event) {
  event.preventDefault();
  const action = event.submitter.value; // Get the value of the clicked button
  performActionsOnSelectedEmails(action);
});

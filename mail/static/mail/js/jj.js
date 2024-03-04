// Delete button
const btn_del = document.createElement("button");
btn_del.innerHTML = "Delete";
btn_del.className = "delete-btn";
btn_del.addEventListener("click", function () {
          fetch(`/emails/${email.id}`, {
                    method: "DELETE",
          }).then(() => {
                    // Remove the email from the DOM
                    document.querySelector(`#email-${id}`).remove();

                    // Optionally, you can reload the mailbox after deleting the email
                    loadMailbox(mailbox);
          });
});
document.querySelector("#user-actions").append(btn_del);
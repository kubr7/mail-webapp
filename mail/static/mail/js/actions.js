$(document).ready(function () {
          $('#selectAll').click(function () {
                    $('.email-checkbox').prop('checked', true);
          });

          $('#markAsRead').click(function () {
                    updateEmails('is_read', true);
          });

          $('#archive').click(function () {
                    updateEmails('is_archived', true);
          });

          $('#delete').click(function () {
                    updateEmails('is_read', true);
          });

          $('#spam').click(function () {
                    updateEmails('is_spam', true);
          });

          function updateEmails(field, value) {
                    var selectedEmails = [];
                    $('.email-checkbox:checked').each(function () {
                              selectedEmails.push($(this).data('email-id'));
                    });

                    if (selectedEmails.length > 0) {
                              $.ajax({
                                        type: 'POST',
                                        url: '/update_emails/',
                                        data: {
                                                  'field': field,
                                                  'value': value,
                                                  'emails': selectedEmails,
                                                  csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                                        },
                                        success: function (data) {
                                                  console.log(data);
                                                  // You may update the UI as needed
                                        }
                              });
                    }
          }
});
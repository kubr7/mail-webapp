from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class Email(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="emails")
    id = models.BigAutoField(primary_key=True)  # Explicitly specify BigAutoField for the primary key
    sender = models.ForeignKey("User", on_delete=models.PROTECT, related_name="emails_sent")
    recipients = models.ManyToManyField("User", related_name="emails_received")
    subject = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    spam = models.BooleanField(default=False)
    important = models.BooleanField(default=False)
    
    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.email,
            "recipients": [user.email for user in self.recipients.all()],
            "subject": self.subject,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%m/%d/%Y"),
            "read": self.read,
            "archived": self.archived,
            "spam": self.spam,
            "important": self.important,
        }
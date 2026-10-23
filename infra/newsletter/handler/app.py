import json
import os

import boto3
from botocore.exceptions import ClientError

table = boto3.resource("dynamodb").Table(os.environ["SUBSCRIBERS_TABLE"])


def _addresses(recipients):
    emails = []
    for recipient in recipients or []:
        email = (recipient.get("emailAddress") or "").strip().lower()
        if email:
            emails.append(email)
    return emails


def _mark(email, status):
    try:
        table.update_item(
            Key={"email": email},
            UpdateExpression="SET #status = :status",
            ConditionExpression="attribute_exists(email)",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":status": status},
        )
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") != "ConditionalCheckFailedException":
            raise


def handler(event, _context):
    for record in event.get("Records", []):
        message = json.loads(record["Sns"]["Message"])
        event_type = message.get("eventType") or message.get("notificationType")
        if event_type == "Bounce":
            bounce = message.get("bounce") or {}
            if bounce.get("bounceType") != "Permanent":
                continue
            for email in _addresses(bounce.get("bouncedRecipients")):
                _mark(email, "bounced")
        elif event_type == "Complaint":
            complaint = message.get("complaint") or {}
            for email in _addresses(complaint.get("complainedRecipients")):
                _mark(email, "complained")
    return {"ok": True}

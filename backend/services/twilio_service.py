import os
import logging
from twilio.rest import Client
from django.conf import settings

logger = logging.getLogger(__name__)

class TwilioService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.from_number = os.getenv('TWILIO_PHONE_NUMBER')
        self.messaging_service_sid = os.getenv('TWILIO_MESSAGING_SERVICE_SID')
        self.client = None
        
        if self.account_sid and self.auth_token:
            try:
                self.client = Client(self.account_sid, self.auth_token)
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {str(e)}")

    def _format_number(self, phone_number):
        """Ensure phone number is in E.164 format for Ghana."""
        if not phone_number:
            return None
        
        # Remove any spaces or dashes
        clean_number = "".join(filter(str.isdigit, str(phone_number)))
        
        # If it starts with 0 and is 10 digits, replace 0 with +233
        if clean_number.startswith('0') and len(clean_number) == 10:
            return f"+233{clean_number[1:]}"
        
        # If it starts with 233 but no +, add +
        if clean_number.startswith('233') and len(clean_number) == 12:
            return f"+{clean_number}"
            
        # If it's already +233, return as is
        if str(phone_number).startswith('+'):
            return str(phone_number)
            
        return phone_number

    def send_sms(self, to_number, message):
        """
        Sends an SMS message using Twilio.
        to_number: Recipient phone number
        message: The message body
        """
        if not self.client:
            logger.warning("Twilio client not initialized. Skipping SMS.")
            return False

        to_number = self._format_number(to_number)
        if not to_number:
            logger.warning("No recipient phone number provided. Skipping SMS.")
            return False

        try:
            params = {
                'body': message,
                'to': to_number
            }
            if self.messaging_service_sid:
                params['messaging_service_sid'] = self.messaging_service_sid
            else:
                params['from_'] = self.from_number

            msg = self.client.messages.create(**params)
            logger.info(f"SMS sent successfully to {to_number}. SID: {msg.sid}")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_number}: {str(e)}")
            return False

    def send_notification(self, user, message):
        """Helper to send notification to a user object if they have a phone number."""
        if hasattr(user, 'phone_number') and user.phone_number:
            return self.send_sms(user.phone_number, message)
        return False

# Global instance
twilio_service = TwilioService()

"""
Notification Service with Real Integrations

Supports:
- Email via Django SMTP
- SMS via Twilio
- WhatsApp via Twilio
"""
import logging
from abc import ABC, abstractmethod
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


class BaseNotificationChannel(ABC):
    @abstractmethod
    def send(self, recipient, message, **kwargs):
        pass


class EmailChannel(BaseNotificationChannel):
    """Send emails using Django's SMTP backend."""
    
    def send(self, recipient, message, **kwargs):
        subject = kwargs.get('subject', 'Abba EZWash Notification')
        html_message = kwargs.get('html_message')
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"Email sent successfully to {recipient}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {recipient}: {e}")
            return False


class SMSChannel(BaseNotificationChannel):
    """Send SMS using Twilio."""
    
    def __init__(self):
        self.client = None
        self.from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
        
        account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
        auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
        
        if account_sid and auth_token:
            try:
                from twilio.rest import Client
                self.client = Client(account_sid, auth_token)
            except ImportError:
                logger.warning("Twilio package not installed. SMS disabled.")
        else:
            logger.warning("Twilio credentials not configured. SMS disabled.")
    
    def send(self, recipient, message, **kwargs):
        if not self.client or not self.from_number:
            logger.info(f"[SMS Mock] Would send to {recipient}: {message}")
            return True  # Mock success
        
        try:
            self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=recipient
            )
            logger.info(f"SMS sent successfully to {recipient}")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS to {recipient}: {e}")
            return False


class WhatsAppChannel(BaseNotificationChannel):
    """Send WhatsApp messages using Twilio."""
    
    def __init__(self):
        self.client = None
        self.from_number = getattr(settings, 'TWILIO_WHATSAPP_NUMBER', None)
        
        account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
        auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
        
        if account_sid and auth_token:
            try:
                from twilio.rest import Client
                self.client = Client(account_sid, auth_token)
            except ImportError:
                logger.warning("Twilio package not installed. WhatsApp disabled.")
        else:
            logger.warning("Twilio credentials not configured. WhatsApp disabled.")
    
    def send(self, recipient, message, **kwargs):
        if not self.client or not self.from_number:
            logger.info(f"[WhatsApp Mock] Would send to {recipient}: {message}")
            return True  # Mock success
        
        try:
            # WhatsApp requires 'whatsapp:' prefix
            self.client.messages.create(
                body=message,
                from_=f"whatsapp:{self.from_number}",
                to=f"whatsapp:{recipient}"
            )
            logger.info(f"WhatsApp sent successfully to {recipient}")
            return True
        except Exception as e:
            logger.error(f"Failed to send WhatsApp to {recipient}: {e}")
            return False


class NotificationService:
    """Unified notification service for all channels."""
    
    def __init__(self):
        self.channels = {
            'email': EmailChannel(),
            'sms': SMSChannel(),
            'whatsapp': WhatsAppChannel()
        }

    def notify(self, user, message, channels=None, **kwargs):
        """
        Send notification to user via specified channels.
        
        Args:
            user: User object with email/phone_number attributes
            message: Notification message
            channels: List of channels ['email', 'sms', 'whatsapp']
            **kwargs: Additional params (subject, html_message, etc.)
        """
        if channels is None:
            channels = ['email']
            
        results = {}
        for channel_name in channels:
            if channel_name not in self.channels:
                results[channel_name] = {'success': False, 'error': 'Invalid channel'}
                continue
                
            # Get recipient based on channel
            if channel_name == 'email':
                recipient = getattr(user, 'email', None)
            else:
                recipient = getattr(user, 'phone_number', None)
            
            if not recipient:
                results[channel_name] = {'success': False, 'error': 'No recipient'}
                logger.warning(f"No recipient found for {channel_name} notification")
                continue
            
            try:
                success = self.channels[channel_name].send(recipient, message, **kwargs)
                results[channel_name] = {'success': success}
            except Exception as e:
                results[channel_name] = {'success': False, 'error': str(e)}
                logger.error(f"Notification error ({channel_name}): {e}")
        
        return results

    def notify_order_placed(self, user, order_id):
        """Convenience method for order placement notification."""
        return self.notify(
            user,
            f"Your Abba EZWash order {order_id} has been placed successfully! We'll notify you when a rider is assigned.",
            channels=['email', 'sms'],
            subject=f"Order Confirmed - {order_id}"
        )

    def notify_order_status(self, user, order_id, status):
        """Notify user of order status change."""
        messages = {
            'ACCEPTED': f"Great news! Your order {order_id} has been accepted. A rider will pick it up soon.",
            'PICKED_UP': f"Your order {order_id} has been picked up by our rider.",
            'CLEANING': f"Your laundry from order {order_id} is now being cleaned.",
            'READY': f"Your order {order_id} is ready! Our rider will deliver it shortly.",
            'DELIVERED': f"Your order {order_id} has been delivered. Thank you for choosing Abba EZWash!"
        }
        message = messages.get(status, f"Order {order_id} status updated to: {status}")
        return self.notify(user, message, channels=['sms'], subject=f"Order Update - {order_id}")


# Singleton instance
notification_service = NotificationService()

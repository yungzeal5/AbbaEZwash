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

    def _format_phone_number(self, phone_number):
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
        self.messaging_service_sid = getattr(settings, 'TWILIO_MESSAGING_SERVICE_SID', None)
        
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
        recipient = self._format_phone_number(recipient)
        if not self.client or (not self.from_number and not self.messaging_service_sid):
            logger.info(f"[SMS Mock] Would send to {recipient}: {message}")
            return True  # Mock success
        
        try:
            params = {
                'body': message,
                'to': recipient
            }
            if self.messaging_service_sid:
                params['messaging_service_sid'] = self.messaging_service_sid
            else:
                params['from_'] = self.from_number

            self.client.messages.create(**params)
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
        recipient = self._format_phone_number(recipient)
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

        return results

    def notify_admin(self, message):
        """Notify admin phone number."""
        admin_phone = getattr(settings, 'ADMIN_PHONE_NUMBER', None)
        if admin_phone:
            return self.channels['sms'].send(admin_phone, message)
        return False

    def notify_order_placed(self, user, order_doc):
        """Notify customer and admin of a new order."""
        order_id = order_doc.get('order_id')
        total = order_doc.get('total_price')
        
        # Notify Customer
        self.notify(
            user,
            f"Your Abba order {order_id} has been placed successfully! Total: GH₵{total}. We'll notify you when a rider is assigned.",
            channels=['sms']
        )
        
        # Notify Admin
        admin_msg = f"🔔 New Order Placed!\nID: {order_id}\nCustomer: {user.username}\nTotal: GH₵{total}\nLocation: {order_doc.get('pickup_location')}"
        self.notify_admin(admin_msg)
        
        return True

    def notify_rider_assigned(self, customer, rider, order_id):
        """Notify customer and rider of assignment."""
        # Notify Customer
        self.notify(
            customer,
            f"A rider ({rider.first_name}) has been assigned to your order {order_id}. You can track their details in your history.",
            channels=['sms']
        )
        
        # Notify Rider
        self.notify(
            rider,
            f"New Task Assigned! Please check your dashboard for order {order_id} and accept it to proceed.",
            channels=['sms']
        )
        return True

    def notify_order_status(self, user, order_id, status_code):
        """Notify user of order status change."""
        messages = {
            'ACCEPTED': f"Great news! Your order {order_id} has been accepted. A rider will pick it up soon.",
            'PICKED_UP': f"Your order {order_id} has been picked up by our rider. We're on it!",
            'CLEANING': f"Your laundry from order {order_id} is now being cleaned with care. ✨",
            'READY': f"Your order {order_id} is ready for delivery! Our rider will arrive shortly.",
            'DELIVERED': f"Your order {order_id} has been delivered. Thank you for choosing Abba EZWash! Luxury clean, delivered."
        }
        message = messages.get(status_code, f"Order {order_id} status updated to: {status_code}")
        return self.notify(user, message, channels=['sms'])


# Singleton instance
notification_service = NotificationService()

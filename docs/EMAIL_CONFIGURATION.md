# Email Configuration Guide

This document explains how to configure email sending for the Funding Manager application.

## Overview

The application supports two email providers with automatic fallback:

1. **Brevo** (Primary/Recommended)
2. **Generic SMTP** (Fallback)

The system automatically detects which provider is configured and uses it accordingly. If neither is configured, the application will fall back to `localhost:25` which will likely fail.

## Configuration Priority

The email provider is selected in the following order:

1. **Brevo** - If `BREVO_HOST`, `BREVO_USERNAME`, and `BREVO_PASSWORD` are configured
2. **SMTP** - If Brevo is not configured but `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are configured
3. **Localhost** - Fallback if neither provider is configured (not recommended)

## Option 1: Brevo Configuration (Recommended)

Brevo (formerly Sendinblue) is a reliable email service provider with good deliverability rates.

### Environment Variables

```env
BREVO_HOST="smtp-relay.brevo.com"
BREVO_PORT="465"
BREVO_SECURE="true"
BREVO_USERNAME="your-brevo-username"
BREVO_PASSWORD="your-brevo-password"
BREVO_SENDER_EMAIL="noreply@yourdomain.com"
```

### Setup Instructions

1. Sign up for a Brevo account at https://www.brevo.com
2. Navigate to SMTP & API settings
3. Get your SMTP credentials
4. Add the credentials to your `.env` file
5. Verify your sender domain/email address

### Default Settings

- **Port**: 465 (SSL/TLS)
- **Secure**: true
- **Host**: smtp-relay.brevo.com

## Option 2: Generic SMTP Configuration (Fallback)

If Brevo is not available, you can use any SMTP provider.

### Environment Variables

```env
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@yourdomain.com"
```

### Common SMTP Providers

#### Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
SMTP_FROM="your-email@gmail.com"
```
**Note**: Gmail requires an app-specific password. Enable 2FA and generate an app password at https://myaccount.google.com/apppasswords

#### Microsoft Outlook
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_FROM="your-email@outlook.com"
```

#### SendGrid
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="verified-sender@yourdomain.com"
```

#### Mailgun
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
SMTP_FROM="noreply@yourdomain.com"
```

#### Amazon SES
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-ses-smtp-username"
SMTP_PASS="your-ses-smtp-password"
SMTP_FROM="verified-email@yourdomain.com"
```

## Port and Security Settings

### Common Port Configurations

- **Port 25**: Unencrypted SMTP (not recommended, often blocked)
- **Port 587**: STARTTLS (recommended for most providers)
  - Set `SMTP_SECURE="false"`
- **Port 465**: SSL/TLS (legacy but still used)
  - Set `SMTP_SECURE="true"`

### When to use `SMTP_SECURE`

- **"true"**: Use SSL/TLS encryption from the start (port 465)
- **"false"**: Use STARTTLS encryption (port 587, 25)

## Sender Email Configuration

The application determines the sender email in the following order:

1. Email-specific `from` field (if provided in the email content)
2. `BREVO_SENDER_EMAIL` (if Brevo is configured)
3. `SMTP_FROM` (if SMTP is configured)
4. `SMTP_USER` (as last resort)

## Verification and Testing

After configuring your email provider, you can verify it's working by:

1. Starting the application
2. Looking for the log message: `[mail] Email provider configured: Brevo` or `[mail] Email provider configured: SMTP`
3. Triggering an email action (e.g., creating a funding request, updating status)
4. Checking the logs for email dispatch messages

### Log Messages

Successful email configuration:
```
[mail] Email provider configured: Brevo
```

Email sending:
```
[mail] Dispatching email { to: 'user@example.com', subject: '...', template: '...' }
[mail] Email dispatched { to: 'user@example.com', subject: '...', messageId: '...' }
```

## Troubleshooting

### Email not sending

1. **Check logs**: Look for error messages in the application logs
2. **Verify credentials**: Ensure all required environment variables are set
3. **Test connection**: Use a tool like `telnet` or `openssl` to test SMTP connectivity
4. **Check firewall**: Ensure your server can reach the SMTP host on the specified port

### Common Issues

**Gmail "Less secure app access"**
- Gmail requires app-specific passwords when 2FA is enabled
- Don't use your regular Gmail password

**Port blocked**
- Many hosting providers block port 25
- Use port 587 or 465 instead

**Authentication failed**
- Double-check your username and password
- Some providers require API keys instead of passwords

**Domain not verified**
- Most SMTP providers require you to verify your sender domain
- Check your provider's documentation for domain verification steps

## Environment Variables Reference

### Brevo Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BREVO_HOST` | Yes | - | Brevo SMTP host |
| `BREVO_PORT` | No | 465 | Brevo SMTP port |
| `BREVO_SECURE` | No | true | Use SSL/TLS |
| `BREVO_USERNAME` | Yes | - | Brevo SMTP username |
| `BREVO_PASSWORD` | Yes | - | Brevo SMTP password |
| `BREVO_SENDER_EMAIL` | Yes | - | Default sender email |

### SMTP Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | Yes | - | SMTP server hostname |
| `SMTP_PORT` | No | 587 | SMTP server port |
| `SMTP_SECURE` | No | false | Use SSL/TLS |
| `SMTP_USER` | Yes | - | SMTP username |
| `SMTP_PASS` | Yes | - | SMTP password |
| `SMTP_FROM` | No | SMTP_USER | Default sender email |

## Best Practices

1. **Always use environment variables** - Never hardcode credentials
2. **Use TLS/SSL** - Enable encryption for security
3. **Verify sender domain** - Improves deliverability
4. **Monitor email logs** - Watch for failures and errors
5. **Test in development** - Verify email configuration before deploying
6. **Use dedicated email service** - Better deliverability than personal email accounts
7. **Configure SPF/DKIM** - Set up proper DNS records for your domain
8. **Handle failures gracefully** - Implement retry logic for transient failures

## Production Recommendations

For production environments, we recommend:

1. **Use Brevo or a dedicated email service provider** (not personal email accounts)
2. **Configure proper DNS records** (SPF, DKIM, DMARC)
3. **Monitor email delivery rates** and bounce rates
4. **Set up email webhooks** for tracking delivery status
5. **Implement email queuing** for high-volume sending
6. **Have a backup SMTP provider** configured

## Support

If you continue to experience issues with email configuration:

1. Check the application logs for detailed error messages
2. Verify your SMTP credentials with your email provider
3. Test your SMTP connection independently
4. Contact your email provider's support team
5. Open an issue on the project repository

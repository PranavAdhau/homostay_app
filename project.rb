------------------ mailer setup Generate App Password -------------------
endable 2FA
Add phone number
(Optional but recommended) Add authenticator
Visit → https://myaccount.google.com/apppasswords
Generate App Password
Add to .env
Restart Rails

-------------------mailer in production do the bellow chnge in the development.rb (or production.rb)
#actual mail 
#   config.action_mailer.delivery_method = :smtp
#   config.action_mailer.perform_deliveries = true
#   config.action_mailer.raise_delivery_errors = true
#   config.action_mailer.smtp_settings = {
#   address: "smtp.gmail.com",
#   port: 587,
#   domain: "gmail.com",
#   user_name: ENV['GMAIL_USERNAME'],
#   password: ENV['GMAIL_APP_PASSWORD'],
#   authentication: "plain",
#   enable_starttls_auto: true
# }
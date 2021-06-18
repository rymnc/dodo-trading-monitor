# Notifiers

Each notifier channel, i.e Webhooks/Slack/Discord/etc **must** implement the `Notification` interface, which is a generic that takes 2 parameters, <P, T> where P: payload Type, T: receipt Type

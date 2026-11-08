import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
})

const sentFrom = new Sender(
    process.env.MAILERSEND_FROM_EMAIL!, // e.g. "no-reply@<domain>"
    process.env.MAILERSEND_FROM_NAME || 'Steady',
)

type SendEmailTemplateParams = {
    to: string
    subject?: string // optional if you want template subject to drive it
    templateId: string

    // data passed into template variables
    data?: Record<string, any>

    // optional reply-to override
    replyToEmail?: string
    replyToName?: string
}

export async function sendEmailTemplate({
    to,
    subject,
    templateId,
    data = {},
    replyToEmail,
    replyToName,
}: SendEmailTemplateParams) {
    const recipients = [new Recipient(to, to)]

    const replyTo = replyToEmail
        ? new Sender(replyToEmail, replyToName || replyToEmail)
        : sentFrom

    const personalization = [
        {
            email: to,
            data: {
                // Common placeholders you can standardize across templates:
                name: data.name ?? '',
                from_name:
                    data.from_name ??
                    (process.env.MAILERSEND_FROM_NAME || 'Steady'),
                action_url: data.action_url ?? '',
                login_url: data.login_url ?? '',
                support_url: data.support_url ?? '',
                help_url: data.help_url ?? '',
                account_name: data.account_name ?? '',
                username: data.username ?? '',

                // Anything else you pass in is also available to the template:
                ...data,
            },
        },
    ]

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(replyTo)
        .setTemplateId(templateId)
        .setPersonalization(personalization)

    // Optional: If you want to explicitly set subject from code (overrides template subject)
    if (subject) {
        emailParams.setSubject(subject)
    }

    await mailerSend.email.send(emailParams)
}

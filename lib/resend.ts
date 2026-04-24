import { render } from '@react-email/components';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Resend } from 'resend';
import JoinConfirmation from '@/emails/JoinConfirmation';
import { env, isResendStubbed } from '@/lib/env';

interface JoinConfirmationArgs {
  to: string;
  name: string;
  eventName: string;
  magicLinkUrl: string;
  revealAtFormatted: string;
}

export async function sendJoinConfirmation(args: JoinConfirmationArgs) {
  const element = JoinConfirmation({
    name: args.name,
    eventName: args.eventName,
    magicLinkUrl: args.magicLinkUrl,
    revealAtFormatted: args.revealAtFormatted,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject = `You're in for ${args.eventName}`;

  if (isResendStubbed) {
    await writeStubEmail({ to: args.to, subject, html, magicLinkUrl: args.magicLinkUrl });
    return { id: 'stub', stubbed: true as const };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: args.to,
    subject,
    html,
    text,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return { id: data?.id ?? 'unknown', stubbed: false as const };
}

async function writeStubEmail(args: {
  to: string;
  subject: string;
  html: string;
  magicLinkUrl: string;
}) {
  const dir = path.join(process.cwd(), 'tmp');
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, 'last-email.html');
  await writeFile(filePath, args.html, 'utf8');
  // eslint-disable-next-line no-console
  console.log(
    [
      '',
      '────────────────── stub email (RESEND_API_KEY unset) ──────────────────',
      `to:      ${args.to}`,
      `subject: ${args.subject}`,
      `link:    ${args.magicLinkUrl}`,
      `html:    ${filePath}`,
      '──────────────────────────────────────────────────────────────────────',
      '',
    ].join('\n'),
  );
}

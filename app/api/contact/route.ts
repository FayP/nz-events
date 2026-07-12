import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/api-validation";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  // 5 submissions per IP per 15 minutes
  const rateLimited = checkRateLimit(request, {
    id: "contact",
    limit: 5,
    windowSeconds: 900,
  });
  if (rateLimited) return rateLimited;
  try {
    const parsed = contactSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid contact form submission" },
        { status: 400 }
      );
    }
    const { name, email, subject, message } = parsed.data;
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: "GoStride Contact <onboarding@resend.dev>",
      to: [process.env.CONTACT_EMAIL || "faypickering1@gmail.com"],
      replyTo: email,
      subject: `[GoStride Contact] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          This message was sent from the GoStride contact form.
          Reply directly to this email to respond to ${safeName}.
        </p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

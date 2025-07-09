import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Check if API key is available
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Resend API key not available. Email would be sent to:', email);
      console.log('📝 Verification code:', verifyCode);
      return { 
        success: true, 
        message: 'Verification email sent successfully. (Development mode - check console for code)' 
      };
    }

    await resend.emails.send({
      from: 'onboarding@resend.dev', // Replace with your sender email
      to: email,
      subject: 'Mystery Message Verification Code',
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}
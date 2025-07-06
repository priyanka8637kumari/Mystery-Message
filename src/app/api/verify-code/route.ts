import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, verifyCode } = await request.json();
    console.log("🔍 Verify code request:", { username, verifyCode });
    
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({
      username: decodedUsername,
    });
    
    if (!user) {
      console.error("❌ User not found:", decodedUsername);
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    console.log("👤 User found:", { 
      username: user.username, 
      storedCode: user.verifyCode, 
      providedCode: verifyCode,
      expiresAt: user.verifyCodeExpires,
      isVerified: user.isVerified 
    });

    const isCodeValid = user.verifyCode === verifyCode;
    const isCodeNotExpired = new Date(user.verifyCodeExpires) > new Date();

    console.log("✅ Validation results:", { isCodeValid, isCodeNotExpired });

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      console.log("🎉 User verified successfully:", user.username);
      return Response.json(
        {
          success: true,
          message: "User verified successfully.",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      console.error("⏰ Verification code expired for:", user.username);
      return Response.json(
        {
          success: false,
          message: "Verification code has expired, please request a new one.",
        },
        { status: 400 }
      );
    } else {
      console.error("❌ Invalid verification code for:", user.username);
      return Response.json(
        {
          success: false,
          message: "Invalid verification code.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in verify-code route:", error);
    return Response.json(
      {
        success: false,
        message: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

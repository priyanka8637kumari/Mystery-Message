import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
//something is missing here, I have to check the imports

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    console.log("🚀 Sign-up API called");
    
    const requestBody = await request.json();
    console.log("📝 Request body:", requestBody);
    
    const { email, username, password } = requestBody;
    
    // Validate required fields
    if (!email || !username || !password) {
      console.error("❌ Missing required fields:", { email: !!email, username: !!username, password: !!password });
      return Response.json(
        {
          success: false,
          message: "All fields (email, username, password) are required.",
        },
        { status: 400 }
      );
    }
    
    console.log("✅ Attempting to register user:", { email, username });
    
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    
    console.log("🔍 Existing verified user by username:", existingUserVerifiedByUsername);
    
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists.",
        },
        { status: 400 }
      );
    }
    const existingUserVerifiedByEmail = await UserModel.findOne({
      email,
    });

    console.log("Existing user by email:", existingUserVerifiedByEmail);

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit verification code

    if (existingUserVerifiedByEmail) {
      if (existingUserVerifiedByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already exists and is verified.",
          },
          { status: 400 }
        );
      }
      else{
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserVerifiedByEmail.password = hashedPassword;
        existingUserVerifiedByEmail.verifyCode = verifyCode;
        existingUserVerifiedByEmail.verifyCodeExpires = new Date(Date.now() + 3600000); // Set expiry to 1 hour from now
        const savedUser = await existingUserVerifiedByEmail.save();
        console.log("Updated existing user:", savedUser._id);
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry to 1 hour from now
      const newUser = new UserModel({
        email,
        username,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpires: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      const savedUser = await newUser.save();
      console.log("Created new user:", savedUser._id);
    }
    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message || "Failed to send verification email.",
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please check your email for verification.",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error registering User:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to register user.",
      },
      { status: 500 }
    );
  }
}

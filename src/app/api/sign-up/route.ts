import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { ca } from "zod/v4/locales";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { email, username, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
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
        await existingUserVerifiedByEmail.save();
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
      await newUser.save();
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

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized access.",
      },
      { status: 401 }
    );
  }

  const userId = user._id;
  const { messageId } = await params;

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in delete-message route:", error);
    return Response.json(
      {
        success: false,
        message: "An error occurred while deleting the message.",
      },
      { status: 500 }
    );
  }
}

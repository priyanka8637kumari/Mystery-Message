"use client";
import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";
import Image from "next/image";

const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user as User;
  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold mb-4 md:mb-0">
          <Image 
            src="/logo.png" 
            alt="Anonymous Inbox Logo" 
            width={32} 
            height={32}
            className="rounded"
          />
          <span>Anonymous Inbox</span>
        </Link>
        {session ? (
          <>
            <span className="mr-4">Welcome {user?.username || user?.email}</span>
            <Button className="w-full md:w-auto" onClick={() => signOut()}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/sign-in">
              <Button className="w-full md:w-auto">Sign In</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

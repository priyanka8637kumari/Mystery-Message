"use client";
import React from "react";

const Footer = () => {
  return (
    <footer className="text-center p-4 md:p-6 bg-gray-900 text-white">
      &copy; {new Date().getFullYear()} Anonymous Inbox. All rights reserved.
    </footer>
  );
};

export default Footer;

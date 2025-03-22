import React from "react";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeButton } from "./ThemeButton";
const AppBar = () => {
  return (
    <div className="flex justify-end items-center p-4 gap-4 h-16">
        <ThemeButton />
      <div>
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
};

export default AppBar;

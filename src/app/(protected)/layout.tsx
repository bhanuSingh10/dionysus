"use client"
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import AppSidebar from "./app-sidebar";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <main className="m-2 w-full">
        <div className="flex items-center gap-2 rounded-md border-sidebar-border bg-sidebar p-2 px-4 shadow">
          {/* <SearchBar/> */}
          <div className="ml-auto"></div>
          <UserButton />
        </div>
        <div className="h-4"></div>
        {/* main contnect */}
        <div className="border-sidebar-border bg-sidebar shadow rounded-md overflow-y-scroll  h-[calc(100vh-5rem)] p-4 ">
          {children}
        </div>

      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;

import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@saasfly/auth";

export default async function DashboardPage() {
  try {
    console.log('Dashboard: Starting...');
    
    // 1. 测试用户认证
    const user = await getCurrentUser();
    console.log('Dashboard: User loaded:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('Dashboard: Redirecting to login');
      redirect("/login");
    }
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Dashboard Test</h1>
        <p>User ID: {user.id}</p>
        <p>User Email: {user.email}</p>
        <p>测试成功！如果看到这个页面，说明基本认证是正常的。</p>
      </div>
    );
    
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Dashboard Error</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
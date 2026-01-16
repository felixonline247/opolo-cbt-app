"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function usePermissions() {
  const [userRole, setUserRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: staffData } = await supabase
          .from("staff")
          .select(`*, roles(name, permissions)`)
          .eq("email", user.email)
          .single();
        
        setUserRole(staffData?.roles);
      }
      setLoading(false);
    }
    getRole();
  }, []);

  const hasPermission = (permission: string) => {
    if (!userRole) return false;
    // Admins with "all" bypass all checks
    if (userRole.permissions?.includes("all")) return true;
    return userRole.permissions?.includes(permission);
  };

  return { hasPermission, loading, roleName: userRole?.name };
}